import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Button, Typography, List, ListItem, ListItemText } from '@mui/material';

interface Comment {
  id: number;
  by: string;
  text: string;
  kids: number[];
  time: number;
}

interface NewsDetail {
  id: number;
  title: string;
  url: string;
  by: string;
  time: number;
  descendants: number;
  kids: number[];
}

const NewsDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [news, setNews] = useState<NewsDetail | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchNewsDetail = async () => {
    const { data } = await axios.get(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
    setNews(data);
    if (data.kids) {
      const commentsData = await Promise.all(
        data.kids.map(async (commentId: number) => {
          const { data } = await axios.get(`https://hacker-news.firebaseio.com/v0/item/${commentId}.json`);
          return data;
        })
      );
      setComments(commentsData);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNewsDetail();
  }, [id]);

  return (
    <div>
      <Button component={Link} to="/" variant="contained" color="primary" style={{ marginBottom: '20px' }}>
        Back to News List
      </Button>
      {loading ? (
        <Typography>Loading...</Typography>
      ) : (
        news && (
          <div>
            <Typography variant="h4">{news.title}</Typography>
            <Typography variant="body1">
              By {news.by} on {new Date(news.time * 1000).toLocaleString()}
            </Typography>
            <Typography variant="body2">
              <a href={news.url} target="_blank" rel="noopener noreferrer">
                Read full article
              </a>
            </Typography>
            <Typography variant="body1">{news.descendants} comments</Typography>
            <Button variant="contained" color="primary" onClick={fetchNewsDetail}>
              Refresh Comments
            </Button>
            <List>
              {comments.map((comment) => (
                <ListItem key={comment.id}>
                  <ListItemText
                    primary={comment.by}
                    secondary={comment.text}
                  />
                </ListItem>
              ))}
            </List>
          </div>
        )
      )}
    </div>
  );
};

export default NewsDetail;
