// soda machine
import SodaMachine from "../pages/SodaMachine";
// Authentication related pages below
import Login from "../pages/Authentication/Login";
import Logout from "../pages/Authentication/Logout";
import Register from "../pages/Authentication/Register";
import ForgetPwd from "../pages/Authentication/ForgetPassword";
// Admin
import Account from "../pages/admin/account";

const authProtectedRoutes = [
  { path: "/products", component: Products },
  { path: "/account", component: Account },
  { path: "/admin/restock-fizz", component: RestockFizz },
]

const publicRoutes = [
  { path: "/", component: Index },
  { path: "/api/script:id", component: UserScript },
  { path: "/logout", component: Logout },
  { path: "/login", component: Login },
  { path: "/forgot-password", component: ForgetPwd },
  { path: "/register", component: Register },
  // eslint-disable-next-line react/display-name
//   { path: "/", exact: true, component: () => <Redirect to="/landing" /> },
]

export { publicRoutes, authProtectedRoutes }