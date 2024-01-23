import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import OpenAI from 'openai';
import './App.css';
import { ChatBubble } from './ChatBubble';
import { ChangeEventHandler, MouseEventHandler, useRef, useState } from 'react';

import {Audio} from './sounds/AudioFile';
interface QueriesInterface {
  type: string;
  timestamp: number;
  query: Promise<unknown>;
  response: Promise<unknown>;
}
//set up the open api here
const openai = new OpenAI({
  apiKey: 'your chat gpt api key', dangerouslyAllowBrowser: true
});


function Hello() {

  const audioPlayer = useRef<HTMLAudioElement>(null);
  const [query, setQuery] = useState('');
  const [queries, setQueries] = useState<QueriesInterface[] | undefined>();
  const setQueryText: ChangeEventHandler<HTMLTextAreaElement> = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setQuery(event.target.value);
  };

  //actually invoke chatgpt api and resolve 
  const invokeChatGptApi = (queryInput:string) =>  new Promise((resolve) => {
    openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          "role": "user",
          "content": queryInput
        }
      ],
      temperature: 0.5,
      max_tokens: 64,
      top_p: 1,
    }).then((resp:any) => {
      //console.log the response 
      if (audioPlayer && audioPlayer.current) {
        audioPlayer.current.play().then(() => {
          resolve(resp.choices[0].message.content);
        })
      }
    });
  });

  const askHandler: MouseEventHandler<HTMLButtonElement> = (event) => {
    event.preventDefault();
    event.stopPropagation();
    let tempQueries;
    if (queries) {
      tempQueries = [
        ...queries,
        {
          type: 'USER',
          timestamp: Date.now(),
          query: new Promise((resolve) => {
            setTimeout(() => {
              if (audioPlayer && audioPlayer.current) {
                audioPlayer.current.play().then(() => {
                  resolve(query);
                })
              }
            }, 100);
          }),
          response: invokeChatGptApi(query),
        },
      ];
    } else {
      tempQueries = [
        {
          type: 'USER',
          timestamp: Date.now(),
          query: new Promise((resolve) => {
            setTimeout(() => {
              resolve(query);
            }, 100);
          }),
          response: invokeChatGptApi(query),
        },
      ];
    }
    setQueries([...tempQueries]);
    setQuery('');
  };

  //greet based on the time of the day

  let greeting = new Promise((resolve) => {
    setTimeout(() => {
      let timeNow = new Date().getHours();
      const greetingText =
        timeNow >= 5 && timeNow < 12
          ? 'Good Morning'
          : timeNow >= 12 && timeNow < 18
          ? 'Good Afternoon'
          : 'Good evening';
      resolve(
        `${greetingText} Commander I'm SunShine, How may I help today? please ask me something...`,
      );
    }, 50);
  });

  return (
    <div id="chat_wrapper">
      <div id="chat_screen">
        <ChatBubble textPromise={greeting} placement="left" />
        {/*display the chat here*/}
        {queries &&
          queries.map((q) => (
            <div key={q.timestamp}>
              <ChatBubble textPromise={q.query} placement="right" />
              <ChatBubble textPromise={q.response} placement="left"/>
            </div>
          ))}
      </div>
      <div id="query_div">
        <textarea
          id="query_input"
          rows={10}
          placeholder="Type your query here"
          value={query}
          onChange={setQueryText}
        />
        <button type="button" className="queryButton" onClick={askHandler}>
          Ask
        </button>
      </div>
      <Audio myRef={audioPlayer} />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
      </Routes>
    </Router>
  );
}
