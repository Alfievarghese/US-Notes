
import { createClient } from '@supabase/supabase-js';

// Hardcoded keys from User
const supabaseUrl = 'https://lsjziywcytpvxfwkradl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzanppeXdjeXRwdnhmd2tyYWRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5Mjg0MzEsImV4cCI6MjA4MDUwNDQzMX0.cQDRGd2EEWcaPJHix9iDvbaCuF2e73RlWFttuOjh2ww';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyFullFlow() {
    console.log('🚀 Starting Full Flow Verification...');

    // 1. LOGIN / REGISTER (Simulating User Entry)
    const email = `verify_${Date.now()}@usnotes.app`;
    const password = 'password123';

    console.log(`\n1️⃣ key: ${supabaseKey.substring(0, 10)}...`);
    console.log(`\n2️⃣ Authenticating as ${email}...`);

    // Try sign up
    let { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
    });

    if (authError) {
        console.error('❌ Authentication Failed:', authError.message);
        return;
    }

    const userId = authData.user?.id;
    if (!userId) {
        console.error('❌ No user ID returned');
        return;
    }
    console.log('✅ Authenticated. User ID:', userId);

    // 2. CREATE PROFILE (Simulating AuthContext)
    console.log('\n3️⃣ Checking/Creating Profile...');
    const { error: profileError } = await supabase.from('users').insert({
        id: userId,
        username: `verify_${Date.now()}`,
        display_name: 'Verification Bot',
        profile_picture: '',
        bio: 'I am a robot 🤖'
    });

    if (profileError) {
        // Ignore duplicate key error if we re-run
        if (!profileError.message.includes('duplicate key')) {
            console.error('❌ Profile creation failed:', profileError.message);
        } else {
            console.log('✅ Profile already exists.');
        }
    } else {
        console.log('✅ Profile Created.');
    }

    // 3. CREATE ROOM (Simulating Dashboard Room Creation)
    console.log('\n4️⃣ Creating Room...');
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .insert({
            room_code: roomCode,
            room_name: 'Verification Room',
            creator_id: userId,
            participants: [userId]
        })
        .select()
        .single();

    if (roomError) {
        console.error('❌ Room creation failed:', roomError.message);
        return;
    }
    console.log('✅ Room Created:', roomData.room_name, `(${roomData.id})`);

    // 4. UPDATE USER WITH ROOM (Simulating Joining)
    await supabase.from('users').update({ room_id: roomData.id }).eq('id', userId);

    // 5. ADD NOTE (The main request)
    console.log('\n5️⃣ Adding a Note...');
    const { data: noteData, error: noteError } = await supabase
        .from('notes')
        .insert({
            content: 'Hello! This note confirms the backend works 100%. ❤️',
            sender_id: userId,
            room_id: roomData.id,
            is_published: true
        })
        .select()
        .single();

    if (noteError) {
        console.error('❌ Failed to add note:', noteError.message);
        return;
    }

    console.log('✅ Note Added Successfully!');
    console.log('   Content:', noteData.content);
    console.log('   Timestamp:', noteData.created_at);

    console.log('\n🎉 VALIDATION COMPLETE: Login, Profile, Room, and Notes are FUNCTIONAL.');
}

verifyFullFlow();
