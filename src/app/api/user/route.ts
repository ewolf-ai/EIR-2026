import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { validateDNI, sanitizeDNI, validateEIRPosition } from '@/lib/security';

// GET - Get user by Firebase UID
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const firebaseUid = searchParams.get('firebase_uid');

    if (!firebaseUid) {
      return NextResponse.json(
        { error: 'Missing firebase_uid parameter' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('firebase_uid', firebaseUid)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// POST - Create new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firebase_uid, email, display_name, photo_url, dni } = body;

    // Validate required fields
    if (!firebase_uid || !email || !dni) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate and sanitize DNI
    const sanitized = sanitizeDNI(dni);
    if (!validateDNI(sanitized)) {
      return NextResponse.json(
        { error: 'Invalid DNI format' },
        { status: 400 }
      );
    }

    // Check if DNI already exists
    const { data: existingDNI } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('dni', sanitized)
      .single();

    if (existingDNI) {
      return NextResponse.json(
        { error: 'This DNI is already registered' },
        { status: 409 }
      );
    }

    // Check if Firebase UID already exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('firebase_uid', firebase_uid)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    // Create user
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert({
        firebase_uid,
        email,
        display_name,
        photo_url,
        dni: sanitized,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create user' },
      { status: 500 }
    );
  }
}

// PATCH - Update user
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { firebase_uid, eir_position } = body;

    if (!firebase_uid) {
      return NextResponse.json(
        { error: 'Missing firebase_uid' },
        { status: 400 }
      );
    }

    // Validate EIR position if provided
    if (eir_position !== undefined && eir_position !== null) {
      if (!validateEIRPosition(eir_position)) {
        return NextResponse.json(
          { error: 'Invalid EIR position. Must be between 1 and 10000' },
          { status: 400 }
        );
      }

      // Check if EIR position is already taken by another user
      const { data: existingPosition } = await supabaseAdmin
        .from('users')
        .select('firebase_uid, display_name')
        .eq('eir_position', eir_position)
        .single();

      if (existingPosition && existingPosition.firebase_uid !== firebase_uid) {
        return NextResponse.json(
          { error: `Este número de plaza ya está siendo usado por ${existingPosition.display_name || 'otro usuario'}` },
          { status: 409 }
        );
      }
    }

    // Update user
    const updateData: any = {};
    if (eir_position !== undefined) updateData.eir_position = eir_position;

    const { data, error } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('firebase_uid', firebase_uid)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update user' },
      { status: 500 }
    );
  }
}
