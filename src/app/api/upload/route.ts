import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize Resend with your API Key environment variable
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerName, phone, address, items, totalAmount, receiptUrl } = body;

    // 1. Format order items for the email body
    const itemsListHtml = items && Array.isArray(items)
      ? items.map((item: any) => `<li><strong>${item.name}</strong> x ${item.quantity} — Rs. ${item.price * item.quantity}</li>`).join('')
      : '<li>No items listed</li>';

    // 2. Send order notification email via Resend
    await resend.emails.send({
      from: 'susatbakes <onboarding@resend.dev>',
      to: 'susatbakes@gmail.com', // Replace with your email address
      subject: `🍰 New Pre-Order from ${customerName || 'Customer'} - Rs. ${totalAmount || 0}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #db2777;">New Pre-Order Received!</h2>
          
          <h3>Customer Details</h3>
          <p><strong>Name:</strong> ${customerName || 'N/A'}</p>
          <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
          <p><strong>Address:</strong> ${address || 'N/A'}</p>

          <h3>Order Details</h3>
          <ul>${itemsListHtml}</ul>
          <p><strong>Total Amount:</strong> Rs. ${totalAmount || 0}</p>

          <h3>Payment Receipt</h3>
          ${
            receiptUrl 
              ? `<p><a href="${receiptUrl}" target="_blank" style="background-color: #db2777; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; display: inline-block;">View Payment Screenshot</a></p>`
              : '<p>No receipt attached.</p>'
          }
        </div>
      `,
    });

    // 3. Return success response to front-end
    return NextResponse.json({ 
      success: true, 
      message: 'Pre-order placed successfully!' 
    }, { status: 200 });

  } catch (error: any) {
    console.error('Order processing error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process pre-order.' },
      { status: 500 }
    );
  }
}