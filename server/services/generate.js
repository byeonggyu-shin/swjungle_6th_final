import '../dotenv.js';
import { Configuration, OpenAIApi } from 'openai';
import * as Taglist from './taglist.js'; 


const configuration = new Configuration({
  apiKey: process.env.MY_OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

// console.log('openai:', openai);
export const generate = async (req, res, ocr) => {
  console.log('generate--------------------------------------------'); 
  console.log('generate: ', ocr); 

  if (!configuration.apiKey) {
    res.status(500).json({
      error: {
        message: 'OpenAI API key not configured, please follow instructions in README.md',
      },
    });
    return;
    
  } try {
    const completion = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: generatePrompt(ocr),
      temperature: 0,
      max_tokens: 400,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      stop: ['<EOL>'],
    });
    // console.log('completion :');
    // console.log(completion.data.choices[0]);
    // res.status(200).json({ result: completion.data });
    return completion.data.choices[0].text;

  } catch(error) {
    // Consider adjusting the error handling logic for your use case
    if (error.response) {
      console.error(error.response.status, error.response.data);
      return error.response.status;
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      return `${error.message}`;
    }
  }
};

const generatePrompt = (ocrResult) => {
  let exportTagCount = process.env.EXPORT_TAG_COUNT;
  let prompt = `Given ${Taglist.countTags()} categories: `; 
  prompt += `${Taglist.convertToPlainText()}.`;
  prompt += `Please select the ${exportTagCount} categories that best describe the uploaded data. If none of the categories are applicable, please select the ${exportTagCount} categories that appear to be most relevant.\n`;
  // console.log(prompt);
  prompt += 'Provide them in JSON format.\'{"tags":[]}\'\n';
  prompt += 'Uploaded data:';
  prompt += ocrResult;
  // console.log(prompt);
  return prompt;
};