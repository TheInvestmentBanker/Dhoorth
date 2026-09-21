import { Routes, Route, Outlet, Navigate } from "react-router-dom";
import { Header, Footer, EdgeBall } from "./components";

import {
  Home,
  Articles,
  Category,
  Article,
  Login,
  Info
} from "./pages";

import {
  AdminHome,
  ManageArticles,
  Editor,
  Categories,
  Comments,
  Settings
} from "./admin";

import { useAuth } from "./context";
import { Box, Button } from "@mui/material";

function Guard() {
  const { user } = useAuth();

  return user ? <AdminShell /> : <Navigate to="/login" replace />;
}

function AdminShell() {
  const navs = [
    ["Dashboard", "/admin"],
    ["Articles", "/admin/articles"],
    ["New Article", "/admin/articles/new"],
    ["Categories", "/admin/categories"],
    ["Comments", "/admin/comments"],
    ["Settings", "/admin/settings"]
  ];

  return (
    <Box sx={{ display: "flex", minHeight: "70vh" }}>
      <Box
        sx={{
          width: { xs: 160, md: 230 },
          borderRight: 1,
          borderColor: "divider",
          p: 1
        }}
      >
        {navs.map(([label, to]) => (
          <Button
            key={to}
            fullWidth
            sx={{ justifyContent: "flex-start" }}
            onClick={() => {
              window.location.href = to;
            }}
          >
            {label}
          </Button>
        ))}
      </Box>

      <Box
        sx={{
          flex: 1,
          p: { xs: 2, md: 4 },
          minWidth: 0
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}

export default function App() {
  return (
    <>
      <Header />

      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<Home />} />
        <Route path="/articles" element={<Articles />} />
        <Route path="/article/:slug" element={<Article />} />
        <Route path="/category/:slug" element={<Category />} />
        <Route path="/subcategory/:slug" element={<Articles />} />
        <Route path="/search" element={<Articles />} />

        <Route path="/login" element={<Login />} />

        <Route
          path="/about"
          element={
            <Info title="About">
              PUBLICATION_NAME is an independent publication for reporting,
              analysis and research.
            </Info>
          }
        />

        <Route
          path="/contact"
          element={
            <Info title="Contact">
              Add your publication contact details from the CMS.
            </Info>
          }
        />

        <Route
          path="/privacy"
          element={
            <Info title="Privacy Policy">
              Replace this placeholder with the final privacy policy before
              launch.
            </Info>
          }
        />

        <Route
          path="/terms"
          element={
            <Info title="Terms & Conditions">
              Replace this placeholder with the final terms before launch.
            </Info>
          }
        />

        <Route
          path="/editorial-policy"
          element={
            <Info title="Editorial Policy">
              Define your standards for sourcing, corrections, sponsored
              material and opinion.
            </Info>
          }
        />

        {/* ADMIN ROUTES */}
        <Route path="/admin" element={<Guard />}>
          <Route element={<AdminShell />}>
            <Route index element={<AdminHome />} />
            <Route path="articles" element={<ManageArticles />} />
            <Route path="articles/new" element={<Editor />} />
            <Route path="articles/edit/:id" element={<Editor />} />
            <Route path="categories" element={<Categories />} />
            <Route path="comments" element={<Comments />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>
      </Routes>

      <Footer />
      <EdgeBall />
    </>
  );
}