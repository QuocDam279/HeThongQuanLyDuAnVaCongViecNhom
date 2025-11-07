import axios from 'axios';

const http = {
  task: axios.create({
    baseURL: 'http://task-service:5004/api/tasks',
    timeout: 5000
  }),
  
  project: axios.create({
    baseURL: 'http://project-service:5003/api/projects',
    timeout: 5000
  }),

  team: axios.create({
    baseURL: 'http://team-service:5002/api/teams',
    timeout: 5000
  })
};

export default http;
