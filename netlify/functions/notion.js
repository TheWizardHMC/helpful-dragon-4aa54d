exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const token = process.env.NOTION_TOKEN;
  if (!token) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'NOTION_TOKEN environment variable is not set' }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body' }) };
  }

  const { endpoint, database_id, page_id, query_body } = body;

  let url, method, requestBody;

  if (endpoint === 'query') {
    if (!database_id) return { statusCode: 400, body: JSON.stringify({ error: 'database_id required' }) };
    url = `https://api.notion.com/v1/databases/${database_id}/query`;
    method = 'POST';
    requestBody = JSON.stringify(query_body || {});
  } else if (endpoint === 'page') {
    if (!page_id) return { statusCode: 400, body: JSON.stringify({ error: 'page_id required' }) };
    url = `https://api.notion.com/v1/pages/${page_id}`;
    method = 'GET';
  } else {
    return { statusCode: 400, body: JSON.stringify({ error: `Unknown endpoint: ${endpoint}` }) };
  }

  try {
    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: method === 'POST' ? requestBody : undefined,
    });

    const data = await response.json();
    return {
      statusCode: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message }),
    };
  }
};
