import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContactEmailRequest {
  customerName: string;
  customerEmail: string;
  subject: string;
  message: string;
  ownerEmail: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { customerName, customerEmail, subject, message, ownerEmail }: ContactEmailRequest = await req.json();

    console.log("Sending email notification to owner:", ownerEmail);

    // Send email using Resend API directly via fetch
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "RN Industries <onboarding@resend.dev>",
        to: [ownerEmail],
        reply_to: customerEmail,
        subject: `New Contact Message: ${subject}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                  line-height: 1.6;
                  color: #333;
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
                }
                .header {
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  color: white;
                  padding: 30px;
                  border-radius: 10px 10px 0 0;
                  text-align: center;
                }
                .header h1 {
                  margin: 0;
                  font-size: 24px;
                }
                .content {
                  background: #f9f9f9;
                  padding: 30px;
                  border-radius: 0 0 10px 10px;
                }
                .info-row {
                  margin: 15px 0;
                  padding: 10px;
                  background: white;
                  border-radius: 5px;
                  border-left: 3px solid #667eea;
                }
                .label {
                  font-weight: bold;
                  color: #667eea;
                  margin-bottom: 5px;
                }
                .message-box {
                  background: white;
                  padding: 20px;
                  border-radius: 5px;
                  margin-top: 20px;
                  border: 1px solid #e0e0e0;
                }
                .footer {
                  margin-top: 20px;
                  padding-top: 20px;
                  border-top: 1px solid #e0e0e0;
                  font-size: 12px;
                  color: #666;
                  text-align: center;
                }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>🔔 New Contact Message</h1>
                <p style="margin: 10px 0 0 0;">You have received a new message from your website</p>
              </div>
              <div class="content">
                <div class="info-row">
                  <div class="label">From:</div>
                  <div>${customerName}</div>
                </div>
                <div class="info-row">
                  <div class="label">Email:</div>
                  <div><a href="mailto:${customerEmail}" style="color: #667eea;">${customerEmail}</a></div>
                </div>
                <div class="info-row">
                  <div class="label">Subject:</div>
                  <div>${subject}</div>
                </div>
                <div class="message-box">
                  <div class="label">Message:</div>
                  <div style="white-space: pre-wrap;">${message}</div>
                </div>
                <div class="footer">
                  <p>Reply to this message by clicking the customer's email address or replying directly to this email.</p>
                  <p style="margin-top: 10px;">© 2025 RN Industries. All rights reserved.</p>
                </div>
              </div>
            </body>
          </html>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      throw new Error(`Resend API error: ${JSON.stringify(errorData)}`);
    }

    const emailData = await emailResponse.json();
    console.log("Email sent successfully:", emailData);

    return new Response(JSON.stringify({ success: true, data: emailData }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
