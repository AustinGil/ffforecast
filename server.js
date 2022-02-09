import * as dotenv from 'dotenv';
import * as http from 'node:http';
dotenv.config();
import * as worker from './src/main.js';

const app = async (request, response) => {
  if (worker.responseProvider) {
    let result = worker.responseProvider(request);
    if (result instanceof Promise) {
      result = await result;
    }
    response.writeHead(200, { 'Content-Type': 'text/html' });
    response.end(result);
    return;
  }

  // response.writeHead(200, { 'Content-Type': 'text/html' });
  // response.end();
};

http.createServer(app).listen(3000, () => {
  console.log('Server running at http://localhost:3000/');
});
