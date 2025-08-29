exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);

    // Debug log
    console.log("Purchase recorded:", body);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  } catch (err) {
    console.error("Error recording purchase:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
