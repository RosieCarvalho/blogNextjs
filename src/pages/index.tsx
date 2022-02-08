import { GetStaticProps } from 'next';
import Head from 'next/head';
import { FiCalendar, FiUser } from 'react-icons/fi';
import Prismic from '@prismicio/client';
import Link from 'next/link';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { useState } from 'react';
import { getPrismicClient } from '../services/prismic';

// import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const [posts, setPosts] = useState(postsPagination);

  const nextPagePosts = (next_page: string): void => {
    fetch(next_page)
      .then(response => response.json())
      .then(data => {
        const postsData = data.results.map(post => {
          return {
            uid: post.uid,
            first_publication_date: post.first_publication_date,
            data: {
              title: post.data.title,
              subtitle: post.data.subtitle,
              author: post.data.author,
            },
          };
        });

        const postsResultPagination = {
          next_page: data.next_page,
          results: posts.results.concat(postsData),
        };
        setPosts(postsResultPagination);
      });
  };

  function formatDate(date) {
    return format(new Date(date), 'dd MMM yyyy', {
      locale: ptBR,
    });
  }

  return (
    <>
      <Head>
        <title>Posts</title>
      </Head>
      <main className={styles.container}>
        <header>
          <img src="/logo.svg" alt="logo" />
        </header>
        <div className={styles.posts}>
          {posts.results.map(post => (
            <Link key={post.uid} href={`/post/${post.uid}`}>
              <a key={post.uid}>
                <strong>{post.data.title}</strong>
                <p>{post.data.subtitle}</p>

                <div className={styles.footerPost}>
                  <div>
                    <FiCalendar />
                    <time className={styles.description}>
                      {formatDate(post.first_publication_date)}
                    </time>
                  </div>
                  <div>
                    <FiUser />
                    <p className={styles.description}>{post.data.author}</p>
                  </div>
                </div>
              </a>
            </Link>
          ))}
        </div>
        {posts.next_page && (
          <div onClick={() => nextPagePosts(posts.next_page)}>
            <a href="#" className={styles.loadMore}>
              Carregar mais posts
            </a>
          </div>
        )}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.Predicates.at('document.type', 'post')],
    {
      pageSize: 1,
    }
  );

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      //  format(
      //   new Date(post.first_publication_date),
      //   'dd MMMM yyyy',
      //   {
      //     locale: ptBR,
      //   }
      // ),
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });
  const postsPagination = {
    next_page: postsResponse.next_page,
    results: posts,
  };

  return {
    props: { postsPagination },
  };
};
