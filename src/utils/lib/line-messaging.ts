// lib/line-messaging.ts

const LINE_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;

/**
 * ฟังก์ชันหลักในการส่ง Push Message ไปยัง User เจาะจงรายคน
 */
export async function sendLinePushMessage(lineUserId: string, messages: any[]) {
  try {
    const response = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LINE_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        to: lineUserId,
        messages: messages, // ส่งได้สูงสุด 5 messages ต่อครั้ง
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`LINE API Error: ${data.message || 'Unknown error'}`);
    }

    return { success: true, data };
  } catch (error) {
    console.error('Failed to send LINE message:', error);
    return { success: false, error };
  }
}