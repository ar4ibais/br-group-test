import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Button, List, ListItem, ListItemText, Typography } from '@mui/material';

interface News {
  id: number;
  title: string;
  score: number;
  by: string;
  time: number;
  descendants: number;
}

const NewsList: React.FC = () => {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchNews = async () => {
    setLoading(true);
    const { data: ids } = await axios.get('https://hacker-news.firebaseio.com/v0/newstories.json');
    const latestNews = ids.slice(0, 100);
    const newsDetails = await Promise.all(
      latestNews.map(async (id: number) => {
        const { data } = await axios.get(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
        return data;
      })
    );
    setNews(newsDetails);
    console.log(ids);
    
    setLoading(false);
  };

  useEffect(() => {
    fetchNews();
    const interval = setInterval(fetchNews, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <Typography variant="h3" gutterBottom>
        Hacker News
      </Typography>
      <Button variant="contained" color="primary" onClick={fetchNews} disabled={loading}>
        {loading ? 'Loading...' : 'Refresh News'}
      </Button>
      <List>
        {news.map((item) => (
          <ListItem key={item.id} component={Link} to={`/news/${item.id}`} button>
            <ListItemText
              primary={item.title}
              secondary={`By ${item.by} | ${new Date(item.time * 1000).toLocaleString()} | ${item.descendants} comments | Score: ${item.score}`}
            />
          </ListItem>
        ))}
      </List>
    </div>
  );
};

export default NewsList;
