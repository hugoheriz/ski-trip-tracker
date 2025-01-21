// src/app/api/activity-types/[id]/route.ts
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description, points } = await request.json();

    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'Activity type name is required' },
        { status: 400 }
      );
    }

    const { rows } = await sql`
      UPDATE activity_types 
      SET name = ${name},
          description = ${description || null},
          points = ${points || null}
      WHERE id = ${params.id}
      RETURNING *
    `;

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'Activity type not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Failed to update activity type:', error);
    return NextResponse.json(
      { error: 'Failed to update activity type' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { rowCount } = await sql`
      DELETE FROM activity_types 
      WHERE id = ${params.id}
    `;

    if (rowCount === 0) {
      return NextResponse.json(
        { error: 'Activity type not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete activity type:', error);
    return NextResponse.json(
      { error: 'Failed to delete activity type' },
      { status: 500 }
    );
  }
}