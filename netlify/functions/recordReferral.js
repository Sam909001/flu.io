exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);

    // Basic validation
    if (!body.referrer || !body.userWallet) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid data" })
      };
    }

    // Example: Save to JSON file or database
    // In production, connect this to Firebase, Supabase, DynamoDB, etc.
    console.log("Referral recorded:", body);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server error" })
    };
  }
};
