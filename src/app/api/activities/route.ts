// src/app/api/activities/route.ts
import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getServerSession } from 'next-auth/next';
import { headers } from 'next/headers';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Constants
const VALID_ACTIVITY_TYPES = ['Skiing', 'Snowboarding', 'Cross-Country', 'Backcountry'];
const RATE_LIMIT_DURATION = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100;

// Simple in-memory rate limiting
const requestCounts = new Map<string, { count: number; timestamp: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const userRequests = requestCounts.get(ip);

  if (!userRequests || (now - userRequests.timestamp) > RATE_LIMIT_DURATION) {
    requestCounts.set(ip, { count: 1, timestamp: now });
    return true;
  }

  if (userRequests.count >= MAX_REQUESTS) {
    return false;
  }

  userRequests.count++;
  return true;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Rate limiting
    const ip = headers().get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const { spotterId, participantId, activityType } = await request.json();

    // Validate required fields
    const missingFields = [];
    if (!participantId) missingFields.push('participantId');
    if (!activityType) missingFields.push('activityType');
    if (!spotterId) missingFields.push('spotterId');

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate activity type
    if (!VALID_ACTIVITY_TYPES.includes(activityType)) {
      return NextResponse.json(
        { error: `Invalid activity type. Must be one of: ${VALID_ACTIVITY_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate that the participant exists
    const participantResult = await sql`
      SELECT id FROM participants WHERE id = ${participantId}
    `;

    if (participantResult.rowCount === 0) {
      return NextResponse.json(
        { error: 'Invalid participant ID' },
        { status: 400 }
      );
    }

    // Insert the activity
    const { rows } = await sql`
      INSERT INTO activities (
        spotter_id,
        participant_id,
        activity_type
      )
      VALUES (
        ${spotterId},
        ${participantId},
        ${activityType}
      )
      RETURNING id, created_at, activity_type
    `;

    return NextResponse.json({ 
      message: 'Activity added successfully',
      activity: rows[0] 
    }, { status: 201 });

  } catch (error) {
    console.error('Error adding activity:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to add activity', details: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Rate limiting
    const ip = headers().get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    const spotterId = searchParams.get('spotterId');
    const typeFilter = searchParams.get('type');
    const locationFilter = searchParams.get('location');

    if (!spotterId) {
      return NextResponse.json(
        { error: 'Spotter ID is required' },
        { status: 400 }
      );
    }

    // Validate type filter if provided
    if (typeFilter && !VALID_ACTIVITY_TYPES.includes(typeFilter)) {
      return NextResponse.json(
        { error: `Invalid activity type filter. Must be one of: ${VALID_ACTIVITY_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    let query = sql`
      SELECT 
        a.id,
        a.created_at as date,
        a.activity_type,
        p.name as location
      FROM activities a
      JOIN participants p ON a.participant_id = p.id
      WHERE a.spotter_id = ${spotterId}
    `;

    if (typeFilter) {
      query = sql`
        ${query} AND a.activity_type = ${typeFilter}
      `;
    }

    if (locationFilter) {
      query = sql`
        ${query} AND p.name = ${locationFilter}
      `;
    }

    query = sql`
      ${query} ORDER BY a.created_at DESC
    `;

    const { rows } = await query;
    return NextResponse.json(rows);

  } catch (error) {
    console.error('Error fetching activities:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to fetch activities', details: errorMessage },
      { status: 500 }
    );
  }
}