require('dotenv').config();
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { Configuration, OpenAIApi } = require('openai');

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const client = new Client({
  authStrategy: new LocalAuth(),
});

client.on('qr', (qr) => {
  qrcode.generate(qr, { small: true });
  console.log('QR code generated, scan it with your WhatsApp mobile app');
});

client.on('ready', () => {
  console.log('WhatsApp Client is ready!');
});

client.on('message', async (message) => {
  console.log(`Message from ${message.from}: ${message.body}`);

  if (message.body.toLowerCase() === 'hi' || message.body.toLowerCase() === 'hello') {
    message.reply('Hello! I am a GPT-powered bot. Ask me anything.');
    return;
  }

  try {
    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: message.body }],
    });

    const reply = response.data.choices[0].message.content;
    message.reply(reply);
  } catch (error) {
    console.error('OpenAI API error:', error);
    message.reply('Sorry, I am having trouble responding right now.');
  }
});

client.initialize();

