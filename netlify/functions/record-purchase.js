// netlify/functions/record-purchase.js

exports.handler = async (event, context) => {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    const data = JSON.parse(event.body);

    // Basic validation
    if (!data.wallet || !data.txHash || !data.amount || !data.tokens) {
      return { statusCode: 400, body: "Missing fields" };
    }

    // 🔐 TODO: Replace this with a real DB (MongoDB, Supabase, Firebase, etc.)
    // For now, just log the purchase
    console.log("✅ Purchase recorded:", data);

    // Respond OK
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: "Purchase recorded" }),
    };
  } catch (err) {
    console.error("record-purchase error:", err);
    return { statusCode: 500, body: "Internal Server Error" };
  }
};
