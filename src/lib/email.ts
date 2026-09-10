import os from 'os';
const LOG_DIR = process.env.NODE_ENV !== 'production' ? path.join(os.tmpdir(), 'susatbakes') : '';

function logEmailFallback(type: string, to: string, subject: string, content: string) {
  if (!LOG_DIR) return;
  try {
    if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
    const logFile = path.join(LOG_DIR, 'sent_emails.log');
    const logEntry = `[${new Date().toISOString()}] [${type}] To: ${to} | Subject: ${subject}\n${content}\n------------------------------------------------------------\n`;
    fs.appendFileSync(logFile, logEntry, 'utf8');
    console.log(`[Email Service] ${type} email logged for ${to}: "${subject}"`);
  } catch (err) {
    console.error('[Email Service] Failed to write email log', err);
  }
}
  try {
    if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
    const logFile = path.join(LOG_DIR, 'sent_emails.log');
    const logEntry = `[${new Date().toISOString()}] [${type}] To: ${to} | Subject: ${subject}\n${content}\n------------------------------------------------------------\n`;
    fs.appendFileSync(logFile, logEntry, 'utf8');
    console.log(`[Email Service] ${type} email logged for ${to}: "${subject}"`);
  } catch (err) {
    console.error('[Email Service] Failed to write email log', err);
  }
}

async function sendViaResend({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  try {
    // Resend free test tier requires sending from onboarding@resend.dev unless a custom domain is verified
    let fromEmail = 'SusatBakes <onboarding@resend.dev>';
    if (process.env.RESEND_FROM_EMAIL) {
      fromEmail = process.env.RESEND_FROM_EMAIL;
    } else if (process.env.FROM_EMAIL && !process.env.FROM_EMAIL.includes('@gmail.com')) {
      fromEmail = process.env.FROM_EMAIL;
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [to],
        reply_to: 'susatbakes@gmail.com',
        subject,
        html,
      }),
    });

    const data = await res.json();
    if (res.ok) {
      console.log(`[Email Service - Resend] Live email sent to ${to} (ID: ${data.id})`);
      return true;
    } else {
      console.error(`[Email Service - Resend Warning for ${to}]:`, data.message || data);
      return false;
    }
  } catch (err) {
    console.error(`[Email Service - Resend Exception for ${to}]:`, err);
    return false;
  }
}

async function sendViaBrevo({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) return false;

  try {
    const fromEmail = process.env.FROM_EMAIL || process.env.ADMIN_EMAIL || 'susatbakes@gmail.com';
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'SusatBakes', email: fromEmail },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    });

    if (res.ok) {
      console.log(`[Email Service - Brevo] Email delivered to ${to}`);
      return true;
    } else {
      const errText = await res.text();
      console.error(`[Email Service - Brevo Error]:`, errText);
      return false;
    }
  } catch (err) {
    console.error(`[Email Service - Brevo Exception]:`, err);
    return false;
  }
}

async function sendSmtpEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT) || 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS?.replace(/\s+/g, ''); // strip any accidental spaces
  const from = process.env.FROM_EMAIL || user || 'susatbakes@gmail.com';

  if (!user || !pass) {
    return false;
  }

  return new Promise((resolve) => {
    try {
      const isSecure = port === 465;
      const socket = isSecure
        ? tls.connect({ host, port, rejectUnauthorized: false })
        : net.connect({ host, port });

      let step = 0;
      let buffer = '';

      socket.on('data', (chunk) => {
        buffer += chunk.toString();
        const lines = buffer.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length === 0) return;

        const lastLine = lines[lines.length - 1];
        // In SMTP, a multi-line reply starts with "XYZ-", and the final line starts with "XYZ "
        const match = lastLine.match(/^(\d{3})(?: (.*))?$/);
        if (!match) {
          // Still waiting for final line of multi-line response
          return;
        }

        const code = parseInt(match[1], 10);
        buffer = ''; // clear buffer for next step

        if (step === 0 && code === 220) {
          socket.write('EHLO localhost\r\n');
          step = 1;
        } else if (step === 1 && code === 250) {
          socket.write('AUTH LOGIN\r\n');
          step = 2;
        } else if (step === 2 && code === 334) {
          socket.write(Buffer.from(user).toString('base64') + '\r\n');
          step = 3;
        } else if (step === 3 && code === 334) {
          socket.write(Buffer.from(pass).toString('base64') + '\r\n');
          step = 4;
        } else if (step === 4 && code === 235) {
          socket.write(`MAIL FROM:<${from}>\r\n`);
          step = 5;
        } else if (step === 5 && code === 250) {
          socket.write(`RCPT TO:<${to}>\r\n`);
          step = 6;
        } else if (step === 6 && code === 250) {
          socket.write('DATA\r\n');
          step = 7;
        } else if (step === 7 && code === 354) {
          const rawEmail = [
            `From: SusatBakes <${from}>`,
            `To: ${to}`,
            `Subject: ${subject}`,
            'MIME-Version: 1.0',
            'Content-Type: text/html; charset=UTF-8',
            `\r\n${html}\r\n.`,
          ].join('\r\n');

          socket.write(rawEmail + '\r\n');
          step = 8;
        } else if (step === 8 && code === 250) {
          socket.write('QUIT\r\n');
          step = 9;
        } else if (step === 9 || code === 221) {
          socket.end();
          console.log(`[Email Service - SMTP] Sent live email to ${to}`);
          resolve(true);
        } else if (code >= 400) {
          console.error(`[Email Service - SMTP Error ${code}]:`, lastLine);
          socket.end();
          resolve(false);
        }
      });

      socket.on('error', (err) => {
        console.error('[SMTP Socket Error]:', err);
        resolve(false);
      });

      setTimeout(() => {
        socket.destroy();
        resolve(false);
      }, 10000);
    } catch (e) {
      console.error('[SMTP Exception]:', e);
      resolve(false);
    }
  });
}

async function dispatchEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  // 1. Try Gmail / SMTP first if SMTP credentials are provided (Works for all customer emails)
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    const ok = await sendSmtpEmail({ to, subject, html });
    if (ok) return true;
  }

  // 2. Try Brevo API (Sends to any customer email)
  if (process.env.BREVO_API_KEY) {
    const ok = await sendViaBrevo({ to, subject, html });
    if (ok) return true;
  }

  // 3. Try Resend API
  if (process.env.RESEND_API_KEY) {
    const ok = await sendViaResend({ to, subject, html });
    if (ok) return true;
  }

  // Fallback logging
  console.warn(
    `[Email Service Notice] Could not deliver live email to "${to}". Saved to data/sent_emails.log.`
  );
  logEmailFallback('NOTIFICATION', to, subject, html);
  return false;
}

export async function sendOrderEmails(order: Order): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL || 'susatbakes@gmail.com';

  const itemsHtml = order.items
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #FCE4EC;">
        <td style="padding: 10px 0; color: #4A2C2A;">
          <strong>${item.name}</strong> (${item.variant}${item.flavor ? ` - ${item.flavor}` : ''})
          ${item.customNote ? `<br><em style="color: #E6007E; font-size: 11px;">"${item.customNote}"</em>` : ''}
        </td>
        <td style="padding: 10px 0; text-align: center; color: #4A2C2A;">${item.quantity}</td>
        <td style="padding: 10px 0; text-align: right; color: #4A2C2A; font-weight: bold;">
          Rs. ${(item.price * item.quantity).toLocaleString()}
        </td>
      </tr>`
    )
    .join('');

  const customerEmailHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Your SusatBakes Pre-Order Confirmation</title>
  </head>
  <body style="background-color: #FDF0F5; font-family: 'Poppins', Helvetica, Arial, sans-serif; margin: 0; padding: 20px;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0">
      <tr>
        <td align="center">
          <table width="600" style="background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #FCE4EC;" cellpadding="0" cellspacing="0">
            <tr>
              <td style="background-color: #4A2C2A; padding: 30px; text-align: center;">
                <h1 style="color: #ffffff; font-family: Georgia, serif; margin: 0; font-size: 26px;">🧁 SusatBakes</h1>
                <p style="color: #FF4DB2; margin: 5px 0 0 0; font-size: 12px; letter-spacing: 2px; text-transform: uppercase;">@susatbakes • Gujranwala</p>
              </td>
            </tr>

            <tr>
              <td style="padding: 30px 35px;">
                <h2 style="color: #4A2C2A; font-family: Georgia, serif; font-size: 20px; margin-top: 0;">
                  Thank You, ${order.customer.name}! 🎉
                </h2>
                <p style="color: #7A4C4A; font-size: 13px; line-height: 1.6;">
                  We have received your pre-order. Our bakers will prepare your batch fresh in Gujranwala for your chosen bake date!
                </p>

                <div style="background-color: #FFF5F9; border-radius: 16px; padding: 20px; margin: 20px 0; border: 1px solid #FCE4EC;">
                  <table width="100%" style="font-size: 12px; color: #4A2C2A;">
                    <tr>
                      <td style="padding: 4px 0;"><strong>Order ID:</strong></td>
                      <td style="padding: 4px 0; text-align: right; color: #E6007E; font-weight: bold;">#${order.id}</td>
                    </tr>
                    <tr>
                      <td style="padding: 4px 0;"><strong>Bake Date:</strong></td>
                      <td style="padding: 4px 0; text-align: right;">${order.date}</td>
                    </tr>
                    <tr>
                      <td style="padding: 4px 0;"><strong>Time Slot:</strong></td>
                      <td style="padding: 4px 0; text-align: right; text-transform: capitalize;">${order.slot}</td>
                    </tr>
                    <tr>
                      <td style="padding: 4px 0;"><strong>Delivery Address (Gujranwala):</strong></td>
                      <td style="padding: 4px 0; text-align: right;">${order.customer.address}</td>
                    </tr>
                    <tr>
                      <td style="padding: 4px 0;"><strong>Payment Method:</strong></td>
                      <td style="padding: 4px 0; text-align: right; font-weight: bold; color: #E6007E;">
                        ${order.paymentType === 'jazzcash' ? 'JazzCash Advance Transfer (0308 4977958)' : 'WhatsApp Pre-Order'}
                      </td>
                    </tr>
                  </table>
                </div>

                <h3 style="color: #4A2C2A; font-size: 14px; margin-bottom: 10px;">Ordered Items:</h3>
                <table width="100%" style="font-size: 12px; border-collapse: collapse;">
                  <thead>
                    <tr style="border-bottom: 2px solid #E6007E; color: #4A2C2A; text-align: left;">
                      <th style="padding-bottom: 8px;">Item</th>
                      <th style="padding-bottom: 8px; text-align: center;">Qty</th>
                      <th style="padding-bottom: 8px; text-align: right;">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsHtml}
                  </tbody>
                </table>

                <div style="text-align: right; margin-top: 20px; padding-top: 15px; border-top: 2px solid #4A2C2A;">
                  <span style="font-size: 14px; color: #7A4C4A;">Grand Total: </span>
                  <span style="font-size: 20px; font-weight: bold; color: #E6007E; font-family: Georgia, serif;">
                    Rs. ${order.total.toLocaleString()}
                  </span>
                </div>

                ${
                  order.paymentType === 'jazzcash'
                    ? `
                <div style="background-color: #FDF0F5; border-left: 4px solid #E6007E; padding: 15px; margin-top: 25px; border-radius: 8px;">
                  <p style="margin: 0; font-size: 12px; color: #4A2C2A;">
                    <strong>📱 JazzCash Advance Transfer:</strong> Please ensure your payment of <strong>Rs. ${order.total.toLocaleString()}</strong> has been transferred to <strong>0308 4977958</strong> (SusatBakes).
                  </p>
                </div>`
                    : ''
                }

                <div style="text-align: center; margin-top: 30px;">
                  <a href="https://wa.me/923706572463" style="background-color: #25D366; color: #ffffff; text-decoration: none; padding: 12px 25px; border-radius: 50px; font-size: 13px; font-weight: bold; display: inline-block;">
                    💬 Contact on WhatsApp (+92 370 6572463)
                  </a>
                </div>

              </td>
            </tr>

            <tr>
              <td style="background-color: #FFF5F9; padding: 20px; text-align: center; font-size: 11px; color: #7A4C4A; border-top: 1px solid #FCE4EC;">
                SusatBakes • Handcrafted Artisanal Bakery • Gujranwala, Pakistan<br>
                For changes, WhatsApp us at +92 370 6572463
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;

  const ownerEmailHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>🚨 NEW PRE-ORDER RECEIVED (#${order.id})</title>
  </head>
  <body style="background-color: #FDF0F5; font-family: Helvetica, Arial, sans-serif; padding: 20px; color: #4A2C2A;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 25px; border: 2px solid #E6007E;">
      <h2 style="color: #E6007E; margin-top: 0;">🚨 New Pre-Order Received! (#${order.id})</h2>
      <p style="font-size: 14px;"><strong>Customer Name:</strong> ${order.customer.name}</p>
      <p style="font-size: 14px;"><strong>Customer Email:</strong> <a href="mailto:${order.customer.email}">${order.customer.email}</a></p>
      <p style="font-size: 14px;"><strong>Phone / WhatsApp:</strong> <a href="https://wa.me/${order.customer.phone.replace(/\D/g, '')}" target="_blank" style="color: #25D366; font-weight: bold;">${order.customer.phone} (Click to Chat)</a></p>
      <p style="font-size: 14px;"><strong>Delivery Address (Gujranwala):</strong> ${order.customer.address}</p>
      <p style="font-size: 14px;"><strong>Bake Date:</strong> ${order.date} (Slot: ${order.slot})</p>
      <p style="font-size: 14px;"><strong>Payment Method:</strong> ${order.paymentType.toUpperCase()}</p>
      ${order.proofUrl ? `<p style="font-size: 14px;"><strong>JazzCash Receipt:</strong> <a href="${order.proofUrl}" target="_blank" style="color: #E6007E; font-weight: bold;">View Uploaded Screenshot</a></p>` : ''}
      ${order.notes ? `<p style="font-size: 14px; background: #FFF5F9; padding: 8px; border-radius: 8px;"><strong>Customer Note:</strong> ${order.notes}</p>` : ''}

      <hr style="border: none; border-top: 1px solid #FCE4EC; margin: 15px 0;">
      <h3 style="margin-bottom: 5px;">Order Items:</h3>
      <table width="100%" style="font-size: 12px; border-collapse: collapse;">
        ${itemsHtml}
      </table>
      <h2 style="color: #4A2C2A; text-align: right; margin-top: 15px;">Total Amount: Rs. ${order.total.toLocaleString()}</h2>
    </div>
  </body>
  </html>
  `;

  // 1. ALWAYS dispatch live Order Alert to Bakery Owner (susatbakes@gmail.com)
  if (adminEmail) {
    await dispatchEmail({
      to: adminEmail,
      subject: `🚨 New Pre-Order #${order.id} (Rs. ${order.total.toLocaleString()}) - ${order.customer.name}`,
      html: ownerEmailHtml,
    });
  }

  // 2. Dispatch Confirmation Receipt to Customer
  if (order.customer.email && order.customer.email.includes('@')) {
    const customerSent = await dispatchEmail({
      to: order.customer.email,
      subject: `🧁 SusatBakes Order Confirmation (#${order.id}) - Delivery on ${order.date}`,
      html: customerEmailHtml,
    });

    // If direct email to customer was restricted by Resend trial domain (which only sends to owner account),
    // deliver a customer receipt copy to susatbakes@gmail.com so the owner has it immediately
    if (!customerSent && adminEmail && order.customer.email.toLowerCase() !== adminEmail.toLowerCase()) {
      await dispatchEmail({
        to: adminEmail,
        subject: `📋 [Customer Copy - Forward to ${order.customer.email}] Order #${order.id}`,
        html: `
          <div style="background: #FFF3CD; border: 1px solid #FFEBAA; padding: 12px 16px; border-radius: 12px; margin-bottom: 16px; font-family: sans-serif; font-size: 12px; color: #856404; line-height: 1.5;">
            <strong>Customer Email Copy:</strong> Because Resend is on the test domain (<code>onboarding@resend.dev</code>), external delivery to <code>${order.customer.email}</code> is restricted.<br>
            You can forward this receipt to <strong>${order.customer.email}</strong> or share with customer on WhatsApp: <a href="https://wa.me/${order.customer.phone.replace(/\D/g, '')}"><strong>${order.customer.phone}</strong></a>.<br>
            <em>To send directly to customer emails automatically, add a Google App Password for susatbakes@gmail.com in .env.local.</em>
          </div>
          ${customerEmailHtml}
        `,
      });
    }
  }
}
