import { useEffect, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Stack,
  TextField,
  Typography
} from "@mui/material";

import {
  Link,
  useNavigate,
  useParams
} from "react-router-dom";

import api from "./api";
import {
  CardArticle,
  ArticleRenderer
} from "./components";

import { useAuth } from "./context";


/* =========================================================
   HOME
========================================================= */

export function Home() {
  const [a, setA] = useState([]);

  useEffect(() => {
    api
      .get("/articles?limit=9")
      .then((r) => setA(r.data.items))
      .catch(() => {});
  }, []);

  return (
    <Container maxWidth="xl" sx={{ py: 5 }}>

      <Typography
        variant="overline"
        color="secondary"
      >
        Independent publication
      </Typography>

      <Typography
        variant="h1"
        sx={{
          fontSize: {
            xs: "2.7rem",
            md: "5rem"
          },
          maxWidth: 1000
        }}
      >
        News, context, research and stories
        worth following.
      </Typography>

      <Typography
        color="text.secondary"
        sx={{
          mt: 2,
          maxWidth: 780
        }}
      >
        Reporting, analysis, science, history,
        technology and deep dives — built for
        an independent editorial voice.
      </Typography>

      <Typography
        variant="h4"
        sx={{
          mt: 7,
          mb: 3
        }}
      >
        Latest
      </Typography>

      <Grid container spacing={3}>
        {a.map((x, i) => (
          <Grid
            item
            xs={12}
            sm={6}
            md={i === 0 ? 6 : 3}
            key={x._id}
          >
            <CardArticle
              a={x}
              featured={i === 0}
            />
          </Grid>
        ))}
      </Grid>

    </Container>
  );
}


/* =========================================================
   ARTICLES
========================================================= */

export function Articles() {
  const [a, setA] = useState([]);
  const [p, setP] = useState(1);
  const [pages, setPages] = useState(1);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("latest");

  const load = () => {
    api
      .get(
        `/articles?page=${p}&limit=12&sort=${sort}&search=${encodeURIComponent(q)}`
      )
      .then((r) => {
        setA(r.data.items);
        setPages(r.data.pages);
      });
  };

  useEffect(() => {
    load();
  }, [p, sort]);

  return (
    <Container
      maxWidth="xl"
      sx={{ py: 5 }}
    >

      <Typography variant="h1">
        Articles
      </Typography>

      <Stack
        direction={{
          xs: "column",
          sm: "row"
        }}
        spacing={2}
        sx={{ my: 4 }}
      >

        <TextField
          fullWidth
          label="Search"
          value={q}
          onChange={(e) =>
            setQ(e.target.value)
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setP(1);
              load();
            }
          }}
        />

        <Select
          value={sort}
          onChange={(e) =>
            setSort(e.target.value)
          }
        >
          <MenuItem value="latest">
            Latest
          </MenuItem>

          <MenuItem value="popular">
            Popular
          </MenuItem>
        </Select>

      </Stack>

      <Grid container spacing={3}>
        {a.map((x) => (
          <Grid
            item
            xs={12}
            sm={6}
            md={4}
            key={x._id}
          >
            <CardArticle a={x} />
          </Grid>
        ))}
      </Grid>

      <Stack
        alignItems="center"
        sx={{ mt: 5 }}
      >
        <Pagination
          count={pages}
          page={p}
          onChange={(_, v) => setP(v)}
        />
      </Stack>

    </Container>
  );
}


/* =========================================================
   CATEGORY
========================================================= */

export function Category() {
  const { slug } = useParams();
  const [a, setA] = useState([]);

  useEffect(() => {
    api
      .get("/categories")
      .then(async (r) => {
        const c = r.data.categories.find(
          (x) => x.slug === slug
        );

        if (c) {
          const response = await api.get(
            `/articles?category=${c._id}&limit=30`
          );

          setA(response.data.items);
        }
      });
  }, [slug]);

  return (
    <Container
      maxWidth="xl"
      sx={{ py: 5 }}
    >

      <Typography
        variant="h1"
        sx={{
          mb: 4,
          textTransform: "capitalize"
        }}
      >
        {slug.replaceAll("-", " ")}
      </Typography>

      <Grid container spacing={3}>
        {a.map((x) => (
          <Grid
            item
            xs={12}
            sm={6}
            md={4}
            key={x._id}
          >
            <CardArticle a={x} />
          </Grid>
        ))}
      </Grid>

    </Container>
  );
}


/* =========================================================
   ARTICLE
========================================================= */

export function Article() {
  const { slug } = useParams();

  const [a, setA] = useState(null);
  const [e, setE] = useState("");

  useEffect(() => {
    api
      .get("/articles/slug/" + slug)
      .then((r) => setA(r.data))
      .catch((x) =>
        setE(
          x.response?.data?.message ||
          "Article not found"
        )
      );
  }, [slug]);

  if (e) {
    return (
      <Container sx={{ py: 8 }}>
        <Alert severity="error">
          {e}
        </Alert>
      </Container>
    );
  }

  if (!a) {
    return (
      <Container sx={{ py: 8 }}>
        Loading…
      </Container>
    );
  }

  return (
    <Container
      maxWidth="lg"
      sx={{
        py: {
          xs: 4,
          md: 7
        }
      }}
    >

      {/* Article Type + Categories */}

      <Stack
        direction="row"
        gap={1}
        flexWrap="wrap"
      >
        <span>
          {a.articleType}
        </span>

        {a.categories?.map((c) => (
          <span key={c._id}>
            · {c.name}
          </span>
        ))}
      </Stack>


      {/* Headline */}

      <Typography
        variant="h1"
        sx={{
          fontSize: {
            xs: "2.6rem",
            md: "5rem"
          },
          mt: 2
        }}
      >
        {a.headline}
      </Typography>


      {/* Subtitle */}

      <Typography
        variant="h6"
        color="text.secondary"
        sx={{ mt: 2 }}
      >
        {a.subtitle || a.summary}
      </Typography>


      {/* Author / Place */}

      <Typography sx={{ mt: 3 }}>
        By{" "}
        <b>
        {a.authorName || a.author?.name}
        </b>

        {a.place && " · " + a.place}
      </Typography>


      {/* Date */}

      <Typography
        variant="caption"
        color="text.secondary"
      >
        {new Date(
          a.publishedAt || a.createdAt
        ).toLocaleString()}

        {a.updatedAt !== a.createdAt &&
          " · Last updated " +
            new Date(
              a.updatedAt
            ).toLocaleString()}
      </Typography>


      {/* =====================================================
          HERO IMAGE
          Always appears before the article content
      ===================================================== */}

      {a.heroImage?.url && (
        <Box sx={{ mt: 4, mb: 5 }}>

          <Box
            component="img"
            src={a.heroImage.url}
            alt={
              a.heroImage.alt ||
              a.headline
            }
            sx={{
              display: "block",
              width: "100%",
              maxHeight: {
                xs: 320,
                md: 650
              },
              objectFit: "cover",
              borderRadius: 1
            }}
          />

          {(a.heroImage.caption ||
            a.heroImage.credit) && (
            <Stack
              direction={{
                xs: "column",
                sm: "row"
              }}
              justifyContent="space-between"
              spacing={1}
              sx={{ mt: 1 }}
            >

              {a.heroImage.caption && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  {a.heroImage.caption}
                </Typography>
              )}

              {a.heroImage.credit && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  {a.heroImage.credit}
                </Typography>
              )}

            </Stack>
          )}

        </Box>
      )}


      {/* =====================================================
          ARTICLE CONTENT
      ===================================================== */}

      <Box
        sx={{
          maxWidth: 780,
          mx: "auto"
        }}
      >

        <ArticleRenderer
          blocks={a.content}
        />


        {/* Sources */}

        <Typography
          variant="h5"
          sx={{ mt: 6 }}
        >
          Sources & References
        </Typography>

        {a.sources?.map((s) => (
          <Box
            key={s._id}
            sx={{ my: 2 }}
          >
            <b>{s.title}</b>

            <br />

            <a
              href={s.url}
              target="_blank"
              rel="noreferrer"
            >
              {s.url}
            </a>
          </Box>
        ))}


        {/* Comments */}

        <Comments
          id={a._id}
          enabled={a.commentsEnabled}
        />

      </Box>

    </Container>
  );
}


/* =========================================================
   COMMENTS
========================================================= */

function Comments({
  id,
  enabled
}) {
  const [c, setC] = useState([]);

  const [f, setF] = useState({
    name: "",
    email: "",
    content: ""
  });

  const [m, setM] = useState("");

  useEffect(() => {
    if (enabled) {
      api
        .get("/comments/article/" + id)
        .then((r) => setC(r.data));
    }
  }, [id, enabled]);

  if (!enabled) {
    return null;
  }

  const timeAgo = (date) => {
    if (!date) return "";

    const seconds = Math.floor(
      (Date.now() - new Date(date).getTime()) / 1000
    );

    if (seconds < 60) {
      return "Just now";
    }

    const minutes = Math.floor(
      seconds / 60
    );

    if (minutes < 60) {
      return `${minutes} ${
        minutes === 1 ? "minute" : "minutes"
      } ago`;
    }

    const hours = Math.floor(
      minutes / 60
    );

    if (hours < 24) {
      return `${hours} ${
        hours === 1 ? "hour" : "hours"
      } ago`;
    }

    const days = Math.floor(
      hours / 24
    );

    if (days < 30) {
      return `${days} ${
        days === 1 ? "day" : "days"
      } ago`;
    }

    const months = Math.floor(
      days / 30
    );

    return `${months} ${
      months === 1 ? "month" : "months"
    } ago`;
  };

  return (
    <Box sx={{ mt: 7 }}>

      <Typography
        variant="h5"
        sx={{
          fontWeight: 700,
          mb: 3
        }}
      >
        Comments
      </Typography>

      {m && (
        <Alert sx={{ my: 2 }}>
          {m}
        </Alert>
      )}

      {/* Comment Form */}
      <Box
        component="form"
        onSubmit={async (e) => {
          e.preventDefault();

          await api.post(
            "/comments",
            {
              article: id,
              ...f
            }
          );

          setF({
            name: "",
            email: "",
            content: ""
          });

          setM(
            "Comment submitted for moderation."
          );
        }}
        sx={{
          mb: 5
        }}
      >

        <Stack spacing={2}>

          <TextField
            label="Name"
            value={f.name}
            onChange={(e) =>
              setF({
                ...f,
                name: e.target.value
              })
            }
            required
          />

          <TextField
            label="Email (private)"
            value={f.email}
            onChange={(e) =>
              setF({
                ...f,
                email: e.target.value
              })
            }
            required
          />

          <TextField
            multiline
            minRows={4}
            label="Comment"
            value={f.content}
            onChange={(e) =>
              setF({
                ...f,
                content: e.target.value
              })
            }
            required
          />

          <Button
            type="submit"
            variant="contained"
            sx={{
              alignSelf: "flex-start"
            }}
          >
            Submit Comment
          </Button>

        </Stack>

      </Box>

      {/* Published Comments */}
      <Stack spacing={3}>

        {c.map((x) => (

          <Box
            key={x._id}
            sx={{
              display: "flex",
              gap: 2,
              py: 2.5,
              borderTop: 1,
              borderColor: "divider"
            }}
          >

            {/* Avatar */}
            <Box
              sx={{
                width: 44,
                height: 44,
                minWidth: 44,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "action.hover",
                color: "text.primary",
                fontWeight: 700,
                fontSize: "1.1rem"
              }}
            >
              {(x.name || "?")
                .charAt(0)
                .toUpperCase()}
            </Box>

            {/* Comment Content */}
            <Box
              sx={{
                flex: 1,
                minWidth: 0
              }}
            >

              <Stack
                direction="row"
                spacing={1}
                alignItems="baseline"
                sx={{
                  flexWrap: "wrap"
                }}
              >

                <Typography
                  sx={{
                    fontWeight: 700
                  }}
                >
                  {x.name}
                </Typography>

                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  {timeAgo(x.createdAt)}
                </Typography>

              </Stack>

              <Typography
                sx={{
                  mt: 0.75,
                  lineHeight: 1.7,
                  fontSize: "1rem"
                }}
              >
                {x.content}
              </Typography>

            </Box>

          </Box>

        ))}

      </Stack>

    </Box>
  );
}


/* =========================================================
   LOGIN
========================================================= */

export function Login() {
  const { login } = useAuth();
  const nav = useNavigate();

  const [e, setE] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState("");

  return (
    <Container
      maxWidth="sm"
      sx={{ py: 10 }}
    >

      <Paper sx={{ p: 5 }}>

        <Typography variant="h3">
          Author Login
        </Typography>

        {err && (
          <Alert
            sx={{ my: 2 }}
            severity="error"
          >
            {err}
          </Alert>
        )}

        <form
          onSubmit={async (x) => {
            x.preventDefault();

            try {
              await login(e, p);
              nav("/admin");
            } catch (z) {
              setErr(
                z.response?.data?.message ||
                "Login failed"
              );
            }
          }}
        >

          <TextField
            fullWidth
            label="Email"
            value={e}
            onChange={(x) =>
              setE(x.target.value)
            }
            sx={{ my: 2 }}
          />

          <TextField
            fullWidth
            type="password"
            label="Password"
            value={p}
            onChange={(x) =>
              setP(x.target.value)
            }
            sx={{ mb: 2 }}
          />

          <Button
            fullWidth
            type="submit"
            variant="contained"
          >
            Login
          </Button>

        </form>

      </Paper>

    </Container>
  );
}


/* =========================================================
   INFO PAGES
========================================================= */

export function Info({
  title,
  children
}) {
  return (
    <Container
      maxWidth="md"
      sx={{ py: 8 }}
    >

      <Typography variant="h1">
        {title}
      </Typography>

      <Typography
        sx={{
          mt: 3,
          lineHeight: 1.9
        }}
      >
        {children}
      </Typography>

    </Container>
  );
}