import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GetStaticPaths, GetStaticProps } from 'next';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import Prismic from '@prismicio/client';
import { useRouter } from 'next/router';
import { getPrismicClient } from '../../services/prismic';

import styles from './post.module.scss';
import Header from '../../components/Header';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter();

  const minuts = () => {
    // rever calculo
    let palavrasHeader = [];
    let palavrasBody = [];
    post.data.content.map(item => {
      const heading = item.heading.split(' ');
      const palavraBody = item.body.map(body => body.text.split(' '));
      palavrasHeader = [...palavrasHeader, ...heading];
      palavrasBody = [...palavrasBody, ...palavraBody];
    });
    const total = palavrasHeader.concat(palavrasBody);
    return `${4} min`;
  };

  function formatDate(date): Date | string {
    return format(new Date(date), 'dd MMM yyyy', {
      locale: ptBR,
    });
  }
  if (router.isFallback) {
    return <h1>Carregando...</h1>;
  }
  return (
    <div className={styles.header}>
      <Header />
      <img src="/roman.png" alt="roman" />
      <div className={styles.body}>
        <h2>{post.data.title}</h2>
        <div className={styles.footerTitle}>
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
          <div>
            <FiClock />
            <time className={styles.description}>{minuts()}</time>
          </div>
        </div>
        {post.data.content.map(item => (
          <div key={item.heading} className={styles.content}>
            <h2>{item.heading}</h2>
            {item.body.map(body => (
              <div
                key={body.text}
                dangerouslySetInnerHTML={{ __html: body.text }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query([
    Prismic.Predicates.at('document.type', 'post'),
  ]);

  const paths = postsResponse.results.map(post => {
    return {
      params: { slug: post.uid },
    };
  });

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async context => {
  const prismic = getPrismicClient();
  const response = await prismic.getByUID(
    'post',
    String(context.params.slug),
    {}
  );

  const post = {
    data: {
      author: response.data.author,
      banner: {
        url: response.data.banner.url,
      },
      content: response.data.content,
      title: response.data.title,
      subtitle: response.data.subtitle,
    },
    first_publication_date: response.first_publication_date,
    uid: response.uid,
  };

  return {
    props: { post },
  };
};
