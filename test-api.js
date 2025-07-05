import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

async function testHealthEndpoint() {
    try {
        console.log('Testing health endpoint...');
        const response = await fetch(`${BASE_URL}/api/health`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            console.log('✅ Health check passed:', data.message);
            console.log(`   Environment: ${data.environment}`);
            console.log(`   Email configured: ${data.emailConfigured}`);
        } else {
            console.log('❌ Health check failed');
        }
    } catch (error) {
        console.log('❌ Health check failed:', error.message);
    }
}

async function testBookingEndpoint() {
    try {
        console.log('\nTesting booking endpoint...');
        
        const bookingData = {
            firstName: 'Test',
            lastName: 'User',
            email: 'test@example.com',
            phone: '+1234567890',
            service: 'Facial Treatment',
            date: '2025-01-20',
            time: '10:00',
            notes: 'This is a test booking'
        };
        
        const response = await fetch(`${BASE_URL}/api/book-appointment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bookingData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            console.log('✅ Booking test passed:', data.message);
        } else {
            console.log('❌ Booking test failed:', data.message);
        }
    } catch (error) {
        console.log('❌ Booking test failed:', error.message);
    }
}

async function testInvalidBooking() {
    try {
        console.log('\nTesting invalid booking (missing fields)...');
        
        const invalidData = {
            firstName: 'Test',
            // Missing required fields
            email: 'invalid-email',
            phone: 'invalid-phone'
        };
        
        const response = await fetch(`${BASE_URL}/api/book-appointment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(invalidData)
        });
        
        const data = await response.json();
        
        if (!data.success) {
            console.log('✅ Invalid booking test passed - correctly rejected:', data.message);
        } else {
            console.log('❌ Invalid booking test failed - should have been rejected');
        }
    } catch (error) {
        console.log('❌ Invalid booking test failed:', error.message);
    }
}

async function testRateLimit() {
    try {
        console.log('\nTesting rate limiting...');
        
        const bookingData = {
            firstName: 'Rate',
            lastName: 'Test',
            email: 'rate@test.com',
            phone: '+1234567890',
            service: 'Test Service',
            date: '2025-01-21',
            time: '11:00'
        };
        
        // Send multiple requests quickly
        const promises = [];
        for (let i = 0; i < 7; i++) {
            promises.push(
                fetch(`${BASE_URL}/api/book-appointment`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(bookingData)
                })
            );
        }
        
        const responses = await Promise.all(promises);
        const rateLimited = responses.some(r => r.status === 429);
        
        if (rateLimited) {
            console.log('✅ Rate limiting test passed - requests were rate limited');
        } else {
            console.log('⚠️  Rate limiting may not be working as expected');
        }
    } catch (error) {
        console.log('❌ Rate limiting test failed:', error.message);
    }
}

async function runTests() {
    console.log('🚀 Starting API tests...\n');
    
    await testHealthEndpoint();
    await testBookingEndpoint();
    await testInvalidBooking();
    await testRateLimit();
    
    console.log('\n✨ Tests completed!');
    console.log('\n📝 Note: Email tests require proper EMAIL_USER and EMAIL_PASS environment variables');
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runTests();
}

export { testHealthEndpoint, testBookingEndpoint, testInvalidBooking, testRateLimit };