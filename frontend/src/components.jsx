import { useEffect, useState } from "react";
import {
  AppBar,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Container,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";

import {
  DarkMode,
  LightMode,
  Menu,
  Search,
  Add,
  Dashboard,
  Logout,
  KeyboardArrowUp,
} from "@mui/icons-material";

import { Link, useNavigate } from "react-router-dom";
import api from "./api";
import { useAuth, useThemeMode } from "./context";
import DarkLogo from "./assets/Dark.png";
import LightLogo from "./assets/Light.png";


export function Header() {
  const { mode, toggle } = useThemeMode();
  const { user, logout } = useAuth();

  const [open, setOpen] = useState(false);
  const [cats, setCats] = useState([]);

  const nav = useNavigate();

  useEffect(() => {
    api
      .get("/categories")
      .then((r) => setCats(r.data.categories || []))
      .catch(() => {});
  }, []);

  return (
    <AppBar
      position="sticky"
      color="transparent"
      elevation={0}
      sx={{
        borderBottom: 1,
        borderColor: "divider",
        backdropFilter: "blur(10px)",
      }}
    >
      <Container maxWidth="xl">
        <Toolbar
          sx={{
            minHeight: {
              xs: 64,
              md: 78,
            },
          }}
        >
          {/* Logo / Publication Name */}
<Box
  component={Link}
  to="/"
  sx={{
    textDecoration: "none",
    color: "inherit",
    display: "flex",
    alignItems: "center",
    gap: 1.2,
    minWidth: {
      xs: 150,
      md: 230,
    },
    ml: {
      xs: -1,
      md: -1,
    },
  }}
>
  <Box
    component="img"
    src={mode === "dark" ? LightLogo : DarkLogo}
    alt="Dhoorth"
    sx={{
      height: {
        xs: 38,
        md: 48,
      },
      width: "auto",
      display: "block",
      objectFit: "contain",
    }}
  />
  <Typography
        sx={{
        fontFamily: "Poppins,serif",
        fontWeight: 800,
        fontSize: {
             xs: 18,
             md: 24,
             },
          }}
        >
         DHOORTH
  </Typography>
</Box>

{/* Desktop Navigation */}
<Stack
  direction="row"
  sx={{
    flex: 1,
    display: {
      xs: "none",
      md: "flex",
    },
  }}
>
  {cats.slice(0, 5).map((c) => (
    <Button
      component={Link}
      to={"/category/" + c.slug}
      key={c._id}
    >
      {c.name}
    </Button>
  ))}

  <Button component={Link} to="/articles">
    Articles
  </Button>
</Stack>   


          {/* Header Actions */}
          <Stack direction="row" alignItems="center">

            {/* Search */}
            <IconButton onClick={() => nav("/search")}>
              <Search />
            </IconButton>


            {/* Theme Toggle */}
            <IconButton onClick={toggle}>
              {mode === "light" ? <DarkMode /> : <LightMode />}
            </IconButton>


            {/* Logged-in Author Actions */}
            {user ? (
              <>
                <Button
                  sx={{
                    display: {
                      xs: "none",
                      md: "inline-flex",
                    },
                  }}
                  startIcon={<Dashboard />}
                  component={Link}
                  to="/admin"
                >
                  Dashboard
                </Button>

                <Button
                  sx={{
                    display: {
                      xs: "none",
                      md: "inline-flex",
                    },
                  }}
                  startIcon={<Add />}
                  component={Link}
                  to="/admin/articles/new"
                >
                  New Article
                </Button>

                <IconButton
                  sx={{
                    display: {
                      xs: "none",
                      md: "inline-flex",
                    },
                  }}
                  onClick={() => {
                    logout();
                    nav("/");
                  }}
                >
                  <Logout />
                </IconButton>
              </>
            ) : (
              /* Logged-out Author */
              <Button
                sx={{
                  display: {
                    xs: "none",
                    md: "inline-flex",
                  },
                }}
                component={Link}
                to="/login"
              >
                Author Login
              </Button>
            )}


            {/* Mobile Menu */}
            <IconButton
              sx={{
                display: {
                  xs: "inline-flex",
                  md: "none",
                },
              }}
              onClick={() => setOpen(true)}
            >
              <Menu />
            </IconButton>

          </Stack>
        </Toolbar>
      </Container>


      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
      >
        <Box
          sx={{
            width: 290,
            p: 2,
          }}
        >
          <Typography variant="h6">
            Navigation
          </Typography>

          <List>
            {[
              ["Home", "/"],
              ["Articles", "/articles"],
              ...cats.map((c) => [
                c.name,
                "/category/" + c.slug,
              ]),
              ["About", "/about"],
              ["Contact", "/contact"],
              ["Editorial Policy", "/editorial-policy"],
            ].map(([x, to]) => (
              <ListItemButton
                component={Link}
                to={to}
                key={to}
                onClick={() => setOpen(false)}
              >
                <ListItemText primary={x} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
}


export function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        mt: 8,
        py: 6,
        borderTop: 1,
        borderColor: "divider",
      }}
    >
      <Container maxWidth="xl">

        <Typography
          variant="h5"
          sx={{
            fontFamily: "Georgia,serif",
            fontWeight: 800,
          }}
        >
          PUBLICATION_NAME
        </Typography>

        <Typography
          color="text.secondary"
          sx={{
            mt: 1,
          }}
        >
          Independent journalism, analysis, research and long-form stories.
        </Typography>

        <Stack
          direction="row"
          gap={2}
          sx={{
            mt: 2,
          }}
        >
          <Button component={Link} to="/about">
            About
          </Button>

          <Button component={Link} to="/contact">
            Contact
          </Button>

          <Button component={Link} to="/privacy">
            Privacy
          </Button>

          <Button component={Link} to="/terms">
            Terms
          </Button>
        </Stack>

        <Typography
          variant="caption"
          color="text.secondary"
        >
          © {new Date().getFullYear()} PUBLICATION_NAME
        </Typography>

      </Container>
    </Box>
  );
}


export function EdgeBall() {
  return (
    <IconButton
      onClick={() =>
        scrollTo({
          top: 0,
          behavior: "smooth",
        })
      }
      sx={{
        position: "fixed",
        right: 18,
        bottom: 18,
        zIndex: 1200,
        bgcolor: "background.paper",
        border: 1,
        borderColor: "divider",
      }}
    >
      <KeyboardArrowUp />
    </IconButton>
  );
}


export function CardArticle({
  a,
  featured = false,
}) {
  return (
    <Card
      sx={{
        height: "100%",
      }}
    >
      <CardActionArea
        component={Link}
        to={"/article/" + a.slug}
      >
        <Box
          sx={{
            height: featured ? 300 : 190,
            background:
              "linear-gradient(135deg,#bdbdbd,#4b4b4b)",
          }}
        />

        <CardContent>

          <Chip
            label={a.articleType || "NEWS"}
            size="small"
            sx={{
              mb: 1,
            }}
          />

          <Typography
            variant={featured ? "h4" : "h6"}
            sx={{
              fontFamily: "Georgia,serif",
              fontWeight: 800,
            }}
          >
            {a.headline}
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              mt: 1,
            }}
          >
            {a.summary}
          </Typography>

        </CardContent>
      </CardActionArea>
    </Card>
  );
}


export function ArticleRenderer({
  blocks = [],
}) {
  return (
    <Box>
      {blocks.map((b, i) =>

        b.type === "heading" ? (

          <Typography
            key={i}
            variant={b.level === 3 ? "h3" : "h2"}
            sx={{
              mt: 5,
              mb: 2,
            }}
          >
            {b.heading || b.text}
          </Typography>

        ) : b.type === "image" ? (

          <Box
            key={i}
            component="figure"
            sx={{
              m: 0,
              my: 4,
            }}
          >
            <img
              src={b.url}
              alt={b.title || ""}
              style={{
                width: "100%",
              }}
            />

            <Typography
              component="figcaption"
              variant="caption"
            >
              {b.caption}{" "}
              {b.credit && "· " + b.credit}
            </Typography>
          </Box>

        ) : b.type === "video" ? (

          <Box
            key={i}
            sx={{
              position: "relative",
              pt: "56.25%",
              my: 4,
            }}
          >
            <iframe
              title={b.title || "Video"}
              src={b.url}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                border: 0,
              }}
              allowFullScreen
            />
          </Box>

        ) : b.type === "document" ? (

          <Card
            key={i}
            variant="outlined"
            sx={{
              my: 3,
              p: 2,
            }}
          >
            <Typography fontWeight={800}>
              {b.title || "Document"}
            </Typography>

            <a
              href={b.url}
              target="_blank"
              rel="noreferrer"
            >
              Open document
            </a>
          </Card>

        ) : b.type === "quote" ? (

          <Card
            key={i}
            sx={{
              my: 3,
              p: 3,
              borderLeft: 4,
              borderColor: "secondary.main",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontStyle: "italic",
              }}
            >
              “{b.text}”
            </Typography>
          </Card>

        ) : (

          <Typography
            key={i}
            component="p"
            sx={{
              fontSize: {
                xs: "1.05rem",
                md: "1.15rem",
              },
              lineHeight: 1.9,
              mb: 2.5,
              whiteSpace:
                b.type === "list"
                  ? "pre-line"
                  : "normal",
            }}
          >
            {b.type === "list"
              ? (b.items || [])
                  .map((x) => "• " + x)
                  .join("\n")
              : b.text}
          </Typography>

        )
      )}
    </Box>
  );
}