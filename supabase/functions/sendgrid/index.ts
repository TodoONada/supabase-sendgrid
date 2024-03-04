import { createClient } from 'https://esm.sh/@supabase/supabase-js'

const SG_API_KEY = Deno.env.get('SG_API_KEY')
 
const handler = async (_request: Request): Promise<Response> => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const { data: recipients, error } = await supabase.from('recipients').select('*')

    if (error) {
      throw error
    }

    const recipientArr = []
    
    let index = 0;

    recipients.forEach((recipient) => {
      recipientArr.push(
        {
          "to": [{"email": recipient.email}],
          "headers": {"Message-ID": `<sample${index}@example.com>`}
        }
      )
      index++
    })

    const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + SG_API_KEY,
      },
      body: JSON.stringify({
        "personalizations": recipientArr,
        "from": {"email": "suda.y@todoonada.co.jp"},
        "subject": "Supabaseからの一斉送信テスト",
        "content": [
          {
            "type": "text/plain",
            "value": "Supabaseからの一斉送信テスト"
          },
          {
            "type": "text/html",
            "value": "<html><head></head><body>Supabaseからの一斉送信テスト</body></html>"
          }
          ]
        }),
    });
  
    return new Response(res.body, {
      status: res.status,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (err) {
    return new Response(String(err?.message ?? err), { status: 500 })
  }
};
 
Deno.serve(handler);