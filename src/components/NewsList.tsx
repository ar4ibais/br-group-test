import React, { useEffect, useState, useRef, useCallback } from 'react';
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
  const [page, setPage] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const observer = useRef<IntersectionObserver | null>(null);

  const fetchNews = async (page: number) => {
    setLoading(true);
    const { data: ids } = await axios.get('https://hacker-news.firebaseio.com/v0/newstories.json');
    const start = page * 20;
    const end = start + 20;
    const currentNews = ids.slice(start, end);

    if (currentNews.length === 0) {
      setHasMore(false);
      setLoading(false);
      return;
    }

    const newsDetails = await Promise.all(
      currentNews.map(async (id: number) => {
        const { data } = await axios.get(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
        return data;
      })
    );

    setNews((prevNews) => [...prevNews, ...newsDetails]);
    setLoading(false);
  };

  const lastNewsElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  useEffect(() => {
    fetchNews(page);
  }, [page]);

  return (
    <div>
      <Typography variant="h3" gutterBottom>
        Hacker News
      </Typography>
      <Button variant="contained" color="primary" onClick={() => fetchNews(0)}>
        Refresh News
      </Button>
      <List>
        {news.map((item, index) => (
          <ListItem
            key={item.id}
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            ref={index === news.length - 1 ? lastNewsElementRef : null}
            component={Link}
            to={`/news/${item.id}`}
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            button
          >
            <ListItemText
              primary={item.title}
              secondary={`By ${item.by} | ${new Date(item.time * 1000).toLocaleString()} | ${item.descendants} comments | Score: ${item.score}`}
            />
          </ListItem>
        ))}
      </List>
      {loading && <Typography>Loading...</Typography>}
    </div>
  );
};

export default NewsList;
