import '../dotenv.js';
import { db } from '../connect.js';
import { Configuration, OpenAIApi } from 'openai';
// import { stringify } from 'uuid';
// import * as Taglist from './taglist.js'; 
/* log */
// import { logger } from '../winston/logger.js';


const configuration = new Configuration({
  apiKey: process.env.MY_OPENAI_API_KEY,
});


const openai = new OpenAIApi(configuration);
export const generate = async (req, res, ocr, userId) => {
  console.log('generate--------------------------------------------'); 
  // console.log('generate: ', ocr); 

  if (!configuration.apiKey) {
    res.status(500).json({
      error: {
        message: 'OpenAI API key not configured, please follow instructions in README.md',
      },
    });
    return;
    
  } try {
    let prompt = await generatePrompt(ocr, userId);

    // console.log(typeof prompt, prompt);

    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt}],
      temperature: 0,
      max_tokens: 400,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      stop: ['<EOL>'],
    });

    return completion.data.choices[0].message.content;
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


const generatePrompt = async (ocrResult, userId) => {
  let connection = null;
  try {
    connection = await db.getConnection();
    const [rows] = await connection.query(`SELECT englishKeyword FROM taglist WHERE user_id = ${userId}`);
    connection.release();
    const taglist = rows.map(row => row.englishKeyword);   // taglist 테이블의 englishKeywords를 리스트로.
    const taglistText = taglist.map(tag => JSON.stringify(tag)).join(',');

    // let prompt = `Given ${taglist.length} categories: `; 
    // prompt += `${taglistText}.`; 
    let exportTagCount = process.env.EXPORT_TAG_COUNT;  // 프롬프트에 2~5 제시
    /* user_id=1 */
    // let prompt = `Please brainstorm and select ${exportTagCount} new and unique categories that best describe the uploaded data. \n
    //               Do this even if you think some categories might already be covered in the existing list (${taglistText}). \n
    //               However, if the new categories exactly match any in the existing list, those from the list will be used. \n`;
    
    /* user_id=3 */
    let prompt = `Given ${taglist.length} categories: `; 
    prompt += `${taglistText}.`;
    prompt = `Please select between 2 to 5 categories that best describe the uploaded data. \n
              Prioritize selecting a category from the given categories, \n
              But if none of the categories are applicable, please select the between 2 to 5 categories that appear to be most relevant. \n
              `;
    prompt += 'Provide them in JSON format.\'{"tags":[]}\'\n';
    prompt += 'Uploaded data:';
    prompt += ocrResult;

    // console.log('prompt: ', prompt);
    return prompt;
  } catch (err) {
    connection?.release();
    console.log(err);
    throw new Error('generate FAILED');
  }
};


/* gpt-3.5-turbo 프롬프트 생성 */
export const generateConversation = async (req, res, ocrResult, userId) => {
  console.log('generateConversation--------------------------------------------'); 
  // console.log('generate: ', ocr); 

  if (!configuration.apiKey) {
    res.status(500).json({
      error: {
        message: 'OpenAI API key not configured, please follow instructions in README.md',
      },
    });
    return;

  } try {
    const systemContent = await generateSystemContent();
    const userContent = await generateUserContent(ocrResult, userId);

    // console.log(typeof prompt, prompt);

    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'system', content: systemContent}, 
        { role: 'user', content: userContent}],
      temperature: 1,
      max_tokens: 250,
      top_p: 0.5,
      frequency_penalty: 0,
      presence_penalty: 0,
    });
    // console.log('generate 결과: ', completion.data.choices[0].message.content);
    return completion.data.choices[0].message.content;
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

const generateSystemContent = async () => {

  let prompt = 'You are an assistant that helps users discover interesting topics based on their input. Your goal is to provide personalized category recommendations by considering the user\'s existing interests list and the provided data. Be creative and think outside the box to suggest new and exciting ideas. Engage in a friendly and thoughtful conversation, offering insights and suggestions beyond the predefined category list.\n';

  let note = 'Note: The data provided by users is extracted from cell phone screenshots using OCR technology. Please be aware that it may contain miscellaneous elements such as cell phone carriers, battery levels, time stamps, and advertisements, which may not contribute to meaningful topics or categories.\n';

  note += 'Also, please note that the user is Korean and would like the tag extraction to be performed in Korean, taking into account the Korean context.\n';

  let behavior = 'Please provide 2 category recommendations that align with the user\'s interests and the provided data.\n';

  let responseType = 'Please provide the categories in JSON format using the \'tags\' property: \'{"tags": []}\'.';
  responseType += 'Example format: \'{"tags": ["Category1", "Category2"]}\'.'; 

  const systemContent = prompt + note + behavior + responseType;
  console.log('System: ', systemContent);
  return systemContent;
};

const generateUserContent = async (ocrResult, userId) => {

  let connection = null;
  try {
    connection = await db.getConnection();
    const [rows] = await connection.query(`SELECT koreanKeyword FROM taglist WHERE user_id = ${userId}`);
    connection.release();
    console.log(rows);
    const taglist = rows.map(row => row.koreanKeyword);   // taglist 테이블의 englishKeywords를 리스트로.
    const taglistText = taglist.map(tag => JSON.stringify(tag)).join(',');
    console.log(taglistText);

    let behavior = '제공된 데이터를 기반으로 관련된 카테고리나 주제를 제안해주세요.\n';
    let data = '데이터:';
    data += ocrResult +'\n';
    
    let note = '';
    if (taglistText.length != 0) {
      note += '유저의 일반적인 관심사를 고려하며, ';
      note += `${taglistText}와 같은 카테고리가 있음을 감안하여, `;
    }
    
    note += '제공된 데이터의 범위를 넘어서도 새롭고 흥미로운 아이디어 혹은 카테고리를 추천할 수 있습니다.';
    
    if (taglistText.length != 0) {
      note += '또한, 유저의 일반적인 관심사에 겹치는 부분이 있다면 해당 카테고리를 우선적으로 추천해도 됩니다.';
    }

    const userContent = behavior + data + note;
    console.log('userContent: ', userContent);
    return userContent;
  } catch (err) {
    connection?.release();
    console.log(err);
    throw new Error('generateUserContent FAILED');
  }
};

