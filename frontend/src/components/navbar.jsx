import NavbarButton from "./navbar-button";
import AppLogo from "../assets/icons/logo.png";
import SearchIcon from "../assets/icons/search.svg";
import UserIcon from "../assets/icons/user.png";
import ChartsIcon from "../assets/icons/charts.png";
import { getData, postData } from "../getUserData";
import { createEffect, createSignal, useContext } from "solid-js";
import { UserContext } from "../contexts/UserContext";
import { useNavigate } from "@solidjs/router";
import LogoutLogo from "../assets/icons/logout.svg";
function Navbar() {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const authorize = async () => {
    if (localStorage.getItem("user") === null) return false;
    const response = await getData("users/user");
    if (response.success) {
      setUser({
        userName: localStorage.getItem("user"),
        id: response.id,
      });
      return true;
    }
    window.location.reload();
    localStorage.removeItem("user");
  };
  const handleSettings = async (e) => {
    e.preventDefault();
    navigate("/user/settings");
  };
  const handleLogout = async (e) => {
    e.preventDefault();
    localStorage.removeItem("user");
    localStorage.removeItem("userId");
    const response = await postData("users/logout");
    navigate("/");
    setUser(null);
  };

  createEffect(() => {
    authorize();
  });

  return (
    <div class="flex flex-col w-20 sticky top-0 bg-slate-700 shadow-lg">
      <div class="flex flex-grow flex-col">
        <NavbarButton destination="/" image={AppLogo} />
        <NavbarButton destination="/search" image={SearchIcon} />
        <NavbarButton destination="/charts" image={ChartsIcon} />
      </div>
      <div class="flex flex-col">
        {user() && (
          <>
            <button
              onclick={handleLogout}
              class="relative flex items-center justify-center h-16 w-16 mt-2 mb-2 mx-auto shadow-lg bg-slate-500 rounded-[30px] hover:rounded-xl transition-all duration-200 ease-linear cursor-pointer"
            >
              <img src={LogoutLogo} alt="Logout" />
            </button>
            <button
              class="relative flex items-center justify-center h-16 w-16 mt-2 mb-2 mx-auto shadow-lg bg-slate-500 rounded-[30px] hover:rounded-xl transition-all duration-200 ease-linear cursor-pointer"
              onclick={handleSettings}
            >
              <svg
                enable-background="new 0 0 32 32"
                height="32px"
                version="1.1"
                viewBox="0 0 32 32"
                width="32px"
                xml:space="preserve"
                xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink"
              >
                <g id="setting_gear_cogwheel_1_">
                  <path
                    d="M17.5,31h-3c-0.244,0-0.453-0.177-0.493-0.418l-0.475-2.848c-0.833-0.175-1.648-0.44-2.431-0.792   l-2.06,2.027c-0.175,0.172-0.448,0.192-0.645,0.048L5.97,27.254c-0.197-0.144-0.263-0.409-0.153-0.628l1.29-2.583   c-0.582-0.641-1.089-1.334-1.513-2.068l-2.846,0.428c-0.247,0.039-0.475-0.106-0.55-0.34l-0.928-2.854   c-0.075-0.232,0.028-0.485,0.245-0.598l2.563-1.333C4.025,16.811,4,16.397,4,16s0.025-0.81,0.079-1.278L1.516,13.39   c-0.217-0.112-0.32-0.365-0.245-0.598l0.927-2.854c0.075-0.232,0.301-0.378,0.55-0.34l2.848,0.427   c0.158-0.274,0.329-0.544,0.509-0.804C6.26,8.992,6.571,8.937,6.799,9.095C7.026,9.252,7.083,9.563,6.926,9.79   c-0.226,0.326-0.435,0.669-0.623,1.019c-0.1,0.185-0.302,0.29-0.515,0.257L3.018,10.65l-0.665,2.048l2.496,1.297   c0.188,0.097,0.293,0.302,0.265,0.511C5.036,15.078,5,15.553,5,16s0.036,0.922,0.113,1.494c0.028,0.209-0.077,0.414-0.265,0.511   l-2.496,1.298l0.666,2.048l2.77-0.416c0.206-0.034,0.415,0.071,0.515,0.258c0.468,0.87,1.062,1.684,1.767,2.417   c0.146,0.152,0.182,0.381,0.087,0.57L6.9,26.694l1.742,1.266l2.005-1.974c0.151-0.148,0.378-0.184,0.569-0.094   c0.904,0.439,1.859,0.75,2.84,0.925c0.208,0.037,0.37,0.201,0.405,0.41L14.924,30h2.152l0.462-2.772   c0.035-0.209,0.197-0.373,0.405-0.41c0.979-0.175,1.936-0.485,2.842-0.925c0.188-0.091,0.418-0.055,0.568,0.094l2.005,1.973   l1.741-1.266l-1.255-2.514c-0.095-0.189-0.06-0.417,0.087-0.57c0.703-0.732,1.298-1.546,1.766-2.417   c0.1-0.186,0.299-0.29,0.515-0.258l2.771,0.415l0.665-2.048l-2.496-1.297c-0.188-0.097-0.293-0.302-0.265-0.511   C26.964,16.922,27,16.447,27,16s-0.036-0.922-0.113-1.494c-0.028-0.209,0.077-0.414,0.265-0.511l2.496-1.298l-0.666-2.048   l-2.77,0.416c-0.211,0.029-0.415-0.072-0.515-0.258c-0.468-0.87-1.062-1.684-1.767-2.417c-0.146-0.152-0.182-0.381-0.087-0.57   L25.1,5.306L23.357,4.04l-2.005,1.974c-0.15,0.148-0.377,0.186-0.569,0.094c-0.904-0.439-1.859-0.75-2.84-0.925   c-0.208-0.037-0.37-0.201-0.405-0.41L17.076,2h-2.152l-0.462,2.772c-0.035,0.209-0.197,0.373-0.405,0.41   c-0.979,0.175-1.936,0.485-2.842,0.925c-0.188,0.091-0.417,0.055-0.568-0.094L8.642,4.041L6.9,5.307L8.155,7.82   c0.123,0.247,0.023,0.548-0.224,0.671C7.684,8.615,7.385,8.514,7.261,8.268L5.816,5.375C5.707,5.156,5.772,4.891,5.97,4.747   l2.427-1.764c0.196-0.145,0.47-0.123,0.645,0.048l2.06,2.026c0.783-0.352,1.599-0.617,2.432-0.792l0.475-2.848   C14.047,1.177,14.256,1,14.5,1h3c0.244,0,0.453,0.177,0.493,0.418l0.475,2.848c0.833,0.175,1.648,0.44,2.431,0.792l2.06-2.027   c0.175-0.171,0.448-0.192,0.645-0.048l2.428,1.764c0.197,0.144,0.263,0.409,0.153,0.628l-1.29,2.583   c0.582,0.641,1.089,1.334,1.513,2.068l2.846-0.428c0.247-0.038,0.475,0.107,0.55,0.34l0.928,2.854   c0.075,0.232-0.028,0.485-0.245,0.598l-2.563,1.333C27.975,15.189,28,15.603,28,16s-0.025,0.81-0.079,1.278l2.563,1.332   c0.217,0.112,0.32,0.365,0.245,0.598l-0.927,2.854c-0.074,0.233-0.303,0.381-0.55,0.34l-2.847-0.427   c-0.425,0.734-0.931,1.428-1.512,2.068l1.289,2.582c0.109,0.219,0.044,0.484-0.153,0.628l-2.427,1.764   c-0.196,0.144-0.47,0.123-0.645-0.048l-2.06-2.026c-0.783,0.352-1.599,0.617-2.432,0.792l-0.475,2.848   C17.953,30.823,17.744,31,17.5,31z M16,20c-2.206,0-4-1.794-4-4s1.794-4,4-4s4,1.794,4,4S18.206,20,16,20z M16,13   c-1.654,0-3,1.346-3,3s1.346,3,3,3s3-1.346,3-3S17.654,13,16,13z"
                    fill="#000000"
                  />
                  <path
                    d="M16,24c-4.411,0-8-3.589-8-8s3.589-8,8-8s8,3.589,8,8c0,1.781-0.573,3.468-1.657,4.878   c-0.168,0.219-0.483,0.259-0.701,0.092c-0.219-0.168-0.26-0.482-0.092-0.701C22.499,19.034,23,17.559,23,16c0-3.859-3.141-7-7-7   s-7,3.141-7,7s3.141,7,7,7c0.828,0,1.642-0.145,2.42-0.43c0.259-0.093,0.547,0.038,0.642,0.298   c0.095,0.259-0.038,0.546-0.298,0.642C17.876,23.835,16.945,24,16,24z"
                    fill="#000000"
                  />
                  <circle cx="20.5" cy="22" fill="#263238" r="0.5" />
                </g>
              </svg>
            </button>
            <NavbarButton
              destination={`/user/${user().userName}/main`}
              image={UserIcon}
            />
          </>
        )}
        {!user() && <NavbarButton destination="/login" image={UserIcon} />}
      </div>
    </div>
  );
}

export default Navbar;
