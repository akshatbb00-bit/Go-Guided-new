import { createBrowserRouter, RouterProvider } from "react-router";
import AppLayout from "../layouts/AppLayout";
import Error from "../pages/Error";
import LoaderOverlay from "../components/common/LoaderOverlay";

// pages
import Home from "../pages/Home";
import Tours from "../pages/Tours";
import Tour from "../components/tours/tour/Tour";
import About from "../pages/About";
import Contact from "../pages/Contact";
import NotFound from "../pages/NotFound";

import Careers from "../components/careers/Careers";
import LoginForm from "../components/auth/LoginForm";
import SignupForm from "../components/auth/SignupForm";

// accounts
import Settings from "../components/dashboard/accounts/Settings";

// user
import UserDashboard from "../components/dashboard/accounts/user/DashBoard";
import UserReviews from "../components/dashboard/accounts/user/reviews/Reviews";
import UserBookings from "../components/dashboard/accounts/user/bookings/Bookings";
import Announcements from "../components/dashboard/accounts/user/Announcements";

//owner
import OwnerDashboard from "../components/dashboard/accounts/Owner/Dashboard";
import OwnerStats from "../components/dashboard/accounts/Owner/Stats";

// admin
import AdminDashBoard from "../components/dashboard/accounts/admin/Dashboard";
import Stats from "../components/dashboard/accounts/admin/Stats";
import Bookings from "../components/dashboard/accounts/admin/Bookings";
import BookingDetails from "../components/dashboard/accounts/admin/BookingDetails";
import AllTours from "../components/dashboard/accounts/admin/Tours";
import AddTour from "../components/dashboard/accounts/admin/AddForm";
import EditTour from "../components/dashboard/accounts/admin/EditTour";
import TourBookings from "../components/dashboard/accounts/admin/TourBookings";
import Reviews from "../components/dashboard/accounts/admin/Reviews";
import AllUsers from "../components/dashboard/accounts/admin/Users";
import FeedBacks from "../components/dashboard/accounts/admin/Feedbacks";
import AllGuides from "../components/dashboard/accounts/admin/Guides";
import ReviewDetails from "../components/dashboard/accounts/admin/ReviewDetails";
import JobRequests from "../components/dashboard/accounts/admin/JobRequests";
import CreateJob from "../components/dashboard/accounts/admin/CreateJob";
import Jobs from "../components/dashboard/accounts/admin/Jobs";
import JobUserDetails from "../components/dashboard/accounts/admin/JobUserDetails";
import UserDetails from "../components/dashboard/accounts/admin/UserDetails";
import GuideDetails from "../components/dashboard/accounts/admin/GuideDetails";
import ManageJobs from "../components/dashboard/accounts/admin/ManageJobs";
import AllAdmins from "../components/dashboard/accounts/admin/AllAdmins";
import AddNewAdmin from "../components/dashboard/accounts/admin/AddNewAdmin";

// guide
import GuideDashboard from "../components/dashboard/accounts/guide/DashBoard";
import GuideStats from "../components/dashboard/accounts/guide/Stats";
import GuideBookings from "../components/dashboard/accounts/guide/Bookings";
import JobApplicationForm from "../components/careers/JobApplicationForm";
import ResetPassword from "../components/auth/ResetPassword";
import BookTourForm from "../components/tours/tour/Booktour";
import PlanTrip from "../pages/PlanTrip";
import MyTrips from "../components/dashboard/accounts/user/trips/MyTrips";
import CustomTrips from "../components/dashboard/accounts/admin/CustomTrips";
import TermsAndConditions from "../pages/Terms";
import PrivacyPolicy from "../pages/privacy";
import Analytics from "../components/dashboard/accounts/admin/Analytics";

const router = createBrowserRouter([
  {
    Component: AppLayout,
    errorElement: <Error />,
    // loadingElement: <Loading />,
    HydrateFallback: LoaderOverlay,
    children: [
      {
        path: "/",
        Component: Home,
      },
      {
        path: "/tours",
        children: [
          {
            index: true,
            Component: Tours,
          },
          {
            path: ":slug",

            children: [
              { index: true, Component: Tour },
              {
                path: "book-tour",
                Component: BookTourForm,
              },
            ],
          },
        ],
      },
      {
        path: "/plan-trip",
        Component: PlanTrip,
      },
      {
        path: "/about",
        Component: About,
      },
      {
        path: "/contact",
        Component: Contact,
      },
      {
        path: "/terms",
        Component: TermsAndConditions,
      },
      {
        path: "/privacy",
        Component: PrivacyPolicy,
      },

      //user
      {
        path: "/user",
        Component: UserDashboard,
        children: [
          // user
          { index: true, Component: Settings },
          {
            path: "announcements",
            Component: Announcements,
          },
          {
            path: "bookings",
            children: [{ index: true, Component: UserBookings }],
          },
          { path: "reviews", Component: UserReviews },
          { path: "trips", Component: MyTrips },
        ],
      },

      //owner
      {
        path: "/owner",
        Component: OwnerDashboard,
        children: [
          { index: true, Component: OwnerStats },
          {
            path: "bookings",
            children: [
              { index: true, Component: Bookings },
              { path: ":id", Component: BookingDetails },
            ],
          },
          { path: "trips", Component: CustomTrips },
          {
            path: "tours",
            children: [
              { index: true, Component: AllTours },
              {
                path: "bookings/:name",
                Component: TourBookings,
              },
              {
                path: "bookings/:name/:id",
                Component: BookingDetails,
              },
              {
                path: "edit/:slug",
                Component: EditTour,
              },
              {
                path: "add",
                Component: AddTour,
              },
            ],
          },

          {
            path: "reviews",
            children: [
              { index: true, Component: Reviews },
              { path: ":id", Component: ReviewDetails },
            ],
          },
          {
            path: "users",
            children: [
              { index: true, Component: AllUsers },
              { path: ":id", Component: UserDetails },
            ],
          },

          { path: "feedbacks", Component: FeedBacks },
          {
            path: "guides",
            children: [
              { index: true, Component: AllGuides },
              { path: ":id", Component: GuideDetails },
            ],
          },
          {
            path: "jobs",
            children: [
              { index: true, Component: Jobs },
              { path: "create-job", Component: CreateJob },
              { path: "manage-jobs", Component: ManageJobs },
              {
                path: "requests",
                children: [
                  { index: true, Component: JobRequests },
                  { path: ":id", Component: JobUserDetails },
                ],
              },
            ],
          },
          { path: "settings", Component: Settings },
          { path: "analytics", Component: Analytics },

          {
            path: "manage-admins",
            children: [
              { index: true, Component: AllAdmins },
              { path: "add-admin", Component: AddNewAdmin },
            ],
          },
        ],
      },

      // admin
      {
        path: "/admin",
        Component: AdminDashBoard,
        children: [
          { index: true, Component: Stats },
          {
            path: "bookings",
            children: [
              { index: true, Component: Bookings },
              { path: ":id", Component: BookingDetails },
            ],
          },
          { path: "trips", Component: CustomTrips },
          {
            path: "tours",
            children: [
              { index: true, Component: AllTours },
              {
                path: "bookings/:name",
                Component: TourBookings,
              },
              {
                path: "bookings/:name/:id",
                Component: BookingDetails,
              },
              {
                path: "edit/:name",
                Component: EditTour,
              },
              {
                path: "add",
                Component: AddTour,
              },
            ],
          },

          {
            path: "reviews",
            children: [
              { index: true, Component: Reviews },
              { path: ":id", Component: ReviewDetails },
            ],
          },
          {
            path: "users",
            children: [
              { index: true, Component: AllUsers },
              { path: ":id", Component: UserDetails },
            ],
          },

          { path: "feedbacks", Component: FeedBacks },
          {
            path: "guides",
            children: [
              { index: true, Component: AllGuides },
              { path: ":id", Component: GuideDetails },
            ],
          },
          {
            path: "jobs",
            children: [
              { index: true, Component: Jobs },
              { path: "create-job", Component: CreateJob },
              { path: "manage-jobs", Component: ManageJobs },
              {
                path: "requests",
                children: [
                  { index: true, Component: JobRequests },
                  { path: ":id", Component: JobUserDetails },
                ],
              },
            ],
          },
          { path: "settings", Component: Settings },
          { path: "analytics", Component: Analytics },


          {
            path: "manage-admins",
            children: [
              { index: true, Component: AllAdmins },
              { path: "add-admin", Component: AddNewAdmin },
            ],
          },
        ],
      },

      // guide
      {
        path: "/guide",
        Component: GuideDashboard,
        children: [
          { index: true, Component: GuideStats },
          { path: "settings", Component: Settings },
          {
            path: "bookings/:status",
            Component: GuideBookings,
            // children: [{ path: ":id", Component: BookingDetails }],
          },
          { path: "bookings/:name/:id", Component: BookingDetails },
        ],
      },

      {
        path: "/careers",
        element: <Careers />,
      },

      {
        path: "/careers/:name/:jobId",
        element: <JobApplicationForm />,
      },

      {
        path: "/login",
        Component: LoginForm,
      },
      {
        path: "/signUp",
        Component: SignupForm,
      },
      {
        path: "/reset-password",
        element: <ResetPassword />,
      },
      {
        path: "*",
        Component: NotFound,
      },
    ],
  },
]);

function AppRouter() {
  return <RouterProvider router={router} />;
}

export default AppRouter;
