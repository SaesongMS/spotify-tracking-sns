import { createComputed, createEffect, createSignal, useContext } from "solid-js";
import { useParams } from "@solidjs/router";
import { UserContext } from "../../../contexts/UserContext";
import { getData, postData } from "../../../getUserData";
import Belmondo from "../../../assets/icons/belmondo.png";
import UserBanner from "../../../components/userpage/userbanner/userbanner";
import ScrobbleRow from "../../../components/userpage/main/scrobbleRow";
import arrowUp from "../../../assets/icons/arrow-up.svg";

function SubjectLibrary() {
  const params = useParams();
  const urlSearch = new URLSearchParams(window.location.search);
  const numberOfRecords = 10;

  const [profile, setProfile] = createSignal(null);
  const { user, setUser } = useContext(UserContext);
  const [subjects, setSubjects] = createSignal(null);
  const [page, setPage] = createSignal(1);
  const [numberOfPages, setNumberOfPages] = createSignal(1);
  const [slicedSubjects, setSlicedSubjects] = createSignal(null);
  const [subject, setSubject] = createSignal(null);

  createEffect(async () => {
    setSubject(params.subject);
  });

  createEffect(async () => {
    if (urlSearch.has("page")) setPage(urlSearch.get("page"));
  });

  createEffect(async () => {
    const userData = await getData(`users/${params.username}`);
    setProfile(userData);
  });

  const getSubjects = async (pageNum) => {
    if (profile() !== null) {
      const data = await postData(`scrobbles/top-${subject()}`, {
        id: profile().id,
        Start: profile().creation_Date,
        PageNumber: page(),
      });
      console.log(data);
      setSubjects(data[subject()]);
    }
  };

  createComputed(async () => {
    getSubjects(page());
  });

  const renderSubject = (s) => {
    switch (subject()) {
      case "artists":
        return (
          <table>
            <ScrobbleRow
              albumCover={s.artist.photo}
              heart="heart"
              title={s.artist.name}
              artist={""}
              rating={s.avgRating}
              date={"Count: " + s.count}
            />
            {/* <p>Count: {s.count}</p> */}
          </table>
        );
      case "albums":
        return (
          <table>
            <ScrobbleRow
              albumCover={s.album.cover}
              heart="heart"
              title={s.album.name}
              artist={s.album.artist.name}
              rating={s.avgRating}
              date={"Count: " + s.count}
            />
            {/* <p>Count: {s.count}</p> */}
          </table>
        );
      case "songs":
        return (
          <table>
            <ScrobbleRow
              albumCover={s.song.album.cover}
              heart="heart"
              title={s.song.title}
              artist={s.song.album.artist.name}
              rating={s.avgRating}
              date={"Count: " + s.count}
            />
            {/* <p>Count: {s.count}</p> */}
          </table>
        );
    }
  };

  return (
    <div class="w-[100%] h-[100%] overflow-y-auto text-[#f2f3ea] ">
      {profile() && (
        <>
          <UserBanner
            avatar={profile().profilePicture}
            username={profile().userName}
            topArtistImage={`data:image/png;base64,${profile().topArtistImage}`}
            scrobbleCount={profile().scrobbles.length}
            favourites={profile().favouriteSongs.length}
            date={new Date(profile().creation_Date).toLocaleDateString()}
            artistCount={profile().artistCount}
            profileId={profile().id}
          />
          <div class="flex flex-row space-x-5 justify-center text-[#f2f3ea]">
            <a href={`/user/${params.username}/library`}>Scrobbles</a>
            <a href={`/user/${params.username}/library/artists`}>Artists</a>
            <a href={`/user/${params.username}/library/albums`}>Albums</a>
            <a href={`/user/${params.username}/library/songs`}>Songs</a>
          </div>
          <div class="w-[80%] p-6 mx-auto flex justify-center">
            <div class="flex flex-col space-y-2 mt-2">
              {subjects() != null &&
                subjects().map((subject) => renderSubject(subject))}
            </div>
          </div>
          {subjects() != null && (
          <div class="flex flex-row justify-center items-center mb-3">
          <button
              class={`text-[#f2f3ea] rounded-md -rotate-90 transform hover:scale-110 transition-all duration-300 ease-in-out ${page() === 1 ? "hidden" : "block"}}`}
              onClick={() => {
                if (page() > 1) setPage(page() - 1);
              }}
            >
              <img
              class="w-6" 
              src={arrowUp} />
            </button>
            <p class="text-[#f2f3ea] text-2xl mx-3 text-center flex items-center justify-center">{page()}</p>
            <button
              class="text-[#f2f3ea] rounded-md rotate-90 transform hover:scale-110 transition-all duration-300 ease-in-out"
              onClick={() => {
                setPage(page() + 1);
              }}
            >
              <img
              class="w-6"  
              src={arrowUp} />
            </button>
          </div>)}
        </>
      )}
    </div>
  );
}

export default SubjectLibrary;
