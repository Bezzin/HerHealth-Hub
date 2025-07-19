import { Express } from 'express';

// LinkedIn OAuth configuration
const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID || 'mock_client_id';
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET || 'mock_client_secret';
const LINKEDIN_REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI || 'http://localhost:5000/api/auth/linkedin/callback';

export function setupLinkedInAuth(app: Express) {
  // LinkedIn OAuth initiation endpoint
  app.get('/api/auth/linkedin', (req, res) => {
    const state = Math.random().toString(36).substring(7); // Generate random state for security
    
    // In production, store state in session for verification
    const linkedinAuthUrl = `https://www.linkedin.com/oauth/v2/authorization?` +
      `response_type=code&` +
      `client_id=${LINKEDIN_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(LINKEDIN_REDIRECT_URI)}&` +
      `state=${state}&` +
      `scope=${encodeURIComponent('r_liteprofile r_emailaddress')}`;
    
    res.json({ authUrl: linkedinAuthUrl });
  });

  // LinkedIn OAuth callback endpoint
  app.get('/api/auth/linkedin/callback', async (req, res) => {
    const { code, state } = req.query;
    
    if (!code) {
      return res.status(400).json({ error: 'Authorization code missing' });
    }

    try {
      // Exchange authorization code for access token
      const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code as string,
          redirect_uri: LINKEDIN_REDIRECT_URI,
          client_id: LINKEDIN_CLIENT_ID,
          client_secret: LINKEDIN_CLIENT_SECRET,
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to exchange code for token');
      }

      const { access_token } = await tokenResponse.json();

      // Fetch user profile
      const profileResponse = await fetch('https://api.linkedin.com/v2/me', {
        headers: {
          'Authorization': `Bearer ${access_token}`,
        },
      });

      if (!profileResponse.ok) {
        throw new Error('Failed to fetch LinkedIn profile');
      }

      const profile = await profileResponse.json();

      // Extract and format profile data
      const profileData = {
        firstName: profile.firstName?.localized?.en_US || '',
        lastName: profile.lastName?.localized?.en_US || '',
        // In a real implementation, you'd extract more data like:
        // - Work experience from /v2/positions
        // - Education from /v2/educations
        // - Skills from /v2/skills
      };

      // Redirect back to the invite page with profile data
      const redirectUrl = new URL('/invite', process.env.FRONTEND_URL || 'http://localhost:5000');
      redirectUrl.searchParams.append('linkedin_data', JSON.stringify(profileData));
      
      res.redirect(redirectUrl.toString());
    } catch (error) {
      console.error('LinkedIn OAuth error:', error);
      res.status(500).json({ error: 'Failed to authenticate with LinkedIn' });
    }
  });

  // Mock endpoint for development
  app.post('/api/auth/linkedin/mock', (req, res) => {
    // Return mock LinkedIn data for testing
    const mockData = {
      firstName: "Dr. Sarah",
      lastName: "Thompson",
      qualifications: "MBBS (King's College London), MRCOG (Royal College of Obstetricians and Gynaecologists), Fellowship in Reproductive Medicine (Oxford)",
      experience: "15+ years in Women's Health and Fertility. Senior Consultant at Guy's and St Thomas' NHS Foundation Trust. Specializes in fertility treatments, PCOS management, and reproductive endocrinology. Published researcher with 20+ peer-reviewed papers.",
      bio: "Passionate about making specialist women's healthcare accessible. I believe every woman deserves timely, expert care for her reproductive health concerns.",
    };
    
    res.json(mockData);
  });
}