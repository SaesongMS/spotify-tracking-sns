import ScrobbleRow from "./scrobbleRow";
import Card from "./card";
import Comment from "./comment";
import { createEffect, createSignal, useContext } from "solid-js";
import { patchData, postData } from "../../../getUserData";
import ArrowUp from "../../../assets/icons/arrow-up.svg";
import Belmondo from "../../../assets/icons/belmondoblur.png";
import Compability from "../compability";
import { AdminContext } from "../../../contexts/AdminContext";

function MainPage(props) {
  const { loggedUser } = props;
  const { admin } = useContext(AdminContext);
  const [comments, setComments] = createSignal(props.comments);
  const [comment, setComment] = createSignal("");
  const [scrobbles, setScrobbles] = createSignal(props.scrobbles);
  const [compability, setCompability] = createSignal(null);
  const [bio, setBio] = createSignal(props.bio);
  const [isEditingBio, setIsEditingBio] = createSignal(false);

  createEffect(() => {
    setComments(props.comments);
    setScrobbles(props.scrobbles);
    setCompability(props.compability.compability);
  }, [props.comments]);

  const handleEditFavouriteSong = (songId, status) => {
    //find scrobbles with songId
    const scrobbleRecords = scrobbles().filter(
      (scrobble) => scrobble.song.id === songId
    );
    //update favouriteSongs depending on status - heart or filledHeart
    scrobbleRecords.forEach((scrobbleRecord) => {
      if (status === "heart") {
        scrobbleRecord.song.favouriteSongs =
          scrobbleRecord.song.favouriteSongs.filter(
            (song) => song.id_User !== loggedUser.id
          );
      } else {
        scrobbleRecord.song.favouriteSongs.push({
          id_User: loggedUser.id,
          id_Song: songId,
        });
      }
    });
    //update array of scrobbles with updated scrobbleRecords
    setScrobbles(
      scrobbles().map((scrobble) => {
        const scrobbleRecord = scrobbleRecords.find(
          (scrobbleRecord) => scrobbleRecord.id === scrobble.id
        );
        if (scrobbleRecord) return scrobbleRecord;
        return scrobble;
      })
    );
  };

  const isFavouriteSong = (scrobbleRecord) => {
    if (
      loggedUser &&
      scrobbleRecord.song.favouriteSongs &&
      scrobbleRecord.song.favouriteSongs.some(
        (song) => song.id_User === loggedUser.id
      )
    )
      return "filledHeart";

    return "heart";
  };

  const handleDeleteComment = (commentId) => {
    setComments(comments().filter((comment) => comment.id !== commentId));
  };

  const handleSendComment = async (e) => {
    e.preventDefault();

    const res = await postData(`comments/profile/create`, {
      comment: comment(),
      recipientId: props.profileId,
    });

    if (res.success) {
      setComments([res.profileComment, ...comments()]);
      setComment("");
    }
  };

  const mockCard = [
    {
      cover: Belmondo,
      mainText: "Your top subject",
      avgRating: "5",
      secText: "will appear here",
    },
  ];

  const handleBioClick = (e) => {
    e.preventDefault();
    if (admin()) setIsEditingBio(true);
  };

  const handleBioEdit = async (e) => {
    e.preventDefault();
    setIsEditingBio(false);
    const res = await patchData(`users/bio`, {
      editedBio: bio(),
      userId: props.profileId,
    });
  };

  return (
    <div class="flex flex-col xl:flex-row-reverse overflow-y-auto 2xl:h-[80%] text-[#f2f3ea] w-full">
      {props.bio && (
        <div id="bio" class="xl:hidden p-6">
          <div>
            <h1 class="text-2xl font-bold">About me</h1>
            <div class="mt-2 text-sm truncate max-w-[350px] sm:max-w-[500px] lg:max-w-[750px]">
              {isEditingBio() ? (
                <input
                  type="text"
                  value={bio()}
                  onInput={(e) => setBio(e.target.value)}
                  onBlur={handleBioEdit}
                  class="text-slate-900"
                />
              ) : (
                <p class="w-fit" onClick={handleBioClick}>
                  {bio()}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      {props.compability && props.compability != -1 && (
        <div id="compability" class="xl:hidden pl-6 pb-6">
          <Compability
            compability={props.compability}
            artists={props.compabilityArtist}
          />
        </div>
      )}
      <div class="xl:border-l-2 border-[#3f4147] w-full xl:w-[40%] p-6 xl:overflow-y-auto">
        Scrobbles
        <table class={`${scrobbles().length == 10 ? "h-[95%]" : ""}`}>
          {scrobbles().map((scrobble) => (
            <ScrobbleRow
              albumCover={scrobble.song.album.cover}
              heart={isFavouriteSong(scrobble)}
              title={scrobble.song.title}
              artist={scrobble.song.album.artist.name}
              album={scrobble.song.album.name}
              rating={scrobble.avgRating}
              songId={scrobble.song.id}
              date={scrobble.scrobble_Date}
              handleEditFavouriteSong={handleEditFavouriteSong}
              subject="songs"
            />
          ))}
        </table>
      </div>
      <div id="page" class="xl:w-[60%] p-6 xl:overflow-y-auto">
        {props.bio && (
          <div id="bio-xl" class="hidden xl:block pb-6 max-w-[850px] h-auto">
            <div>
              <h1 class="text-2xl font-bold">About me</h1>
              <div
                class="mt-2 text-sm line-clamp-1 hover:line-clamp-none w-fit"
                onClick={handleBioClick}
              >
                {isEditingBio() ? (
                  <input
                    type="text"
                    value={bio()}
                    onInput={(e) => setBio(e.target.value)}
                    onBlur={handleBioEdit}
                    class="text-slate-900"
                  />
                ) : (
                  bio()
                )}
              </div>
            </div>
          </div>
        )}
        <h1 class="text-2xl font-bold pb-2">Top subjects</h1>
        Artist
        <br />
        <div class="grid grid-cols-2 lg:grid-cols-5 w-[100%] gap-4 mt-4 mb-4">
          {props.topArtists.length !== 0
            ? props.topArtists
                .slice(0, 5)
                .map((topArtist) => (
                  <Card
                    cover={`data:image/png;base64,${topArtist.artist.photo}`}
                    mainText={topArtist.artist.name}
                    rating={topArtist.rating}
                    subject="artist"
                  />
                ))
            : mockCard
                .slice(0, 5)
                .map((topArtist) => (
                  <Card
                    cover={topArtist.cover}
                    mainText={topArtist.mainText}
                    secText={topArtist.secText}
                    rating={topArtist.rating}
                    subject="artist"
                  />
                ))}
          <div class="flex flex-col justify-center items-center lg:hidden">
            <a
              href={`/user/${props.username}/library/albums`}
              class="cursor-pointer hover:opacity-80"
            >
              <img class="w-8 h-8 rotate-90" src={ArrowUp} />
            </a>
            <a
              href={`/user/${props.username}/library/albums`}
              class="cursor-pointer hover:opacity-80"
            >
              <p>See more</p>
            </a>
          </div>
        </div>
        Album
        <br />
        <div class="grid grid-cols-2 lg:grid-cols-5 w-[100%] gap-4 mt-4 mb-4">
          {props.topAlbums.length !== 0
            ? props.topAlbums
                .slice(0, 5)
                .map((topAlbum) => (
                  <Card
                    cover={`data:image/png;base64,${topAlbum.album.cover}`}
                    mainText={topAlbum.album.name}
                    secText={topAlbum.album.artist.name}
                    rating={topAlbum.rating}
                    subject="album"
                  />
                ))
            : mockCard
                .slice(0, 5)
                .map((topAlbum) => (
                  <Card
                    cover={topAlbum.cover}
                    mainText={topAlbum.mainText}
                    secText={topAlbum.secText}
                    rating={topAlbum.rating}
                    subject="album"
                  />
                ))}
          <div class="flex flex-col justify-center items-center lg:hidden">
            <a
              href={`/user/${props.username}/library/albums`}
              class="cursor-pointer hover:opacity-80"
            >
              <img class="w-8 h-8 rotate-90" src={ArrowUp} />
            </a>
            <a
              href={`/user/${props.username}/library/albums`}
              class="cursor-pointer hover:opacity-80"
            >
              <p>See more</p>
            </a>
          </div>
        </div>
        Song
        <br />
        <div class="grid grid-cols-2 lg:grid-cols-5 w-[100%] gap-4 mt-4 mb-4">
          {props.topSongs.length !== 0
            ? props.topSongs
                .slice(0, 5)
                .map((topSong) => (
                  <Card
                    cover={`data:image/png;base64,${topSong.song.album.cover}`}
                    mainText={topSong.song.title}
                    secText={topSong.song.album.artist.name}
                    rating={topSong.rating}
                    subject="song"
                  />
                ))
            : mockCard
                .slice(0, 5)
                .map((topSong) => (
                  <Card
                    cover={topSong.cover}
                    mainText={topSong.mainText}
                    secText={topSong.secText}
                    rating={topSong.rating}
                    subject="song"
                  />
                ))}
          <div class="flex flex-col justify-center items-center lg:hidden">
            <a
              href={`/user/${props.username}/library/songs`}
              class="cursor-pointer hover:opacity-80"
            >
              <img class="w-8 h-8 rotate-90" src={ArrowUp} />
            </a>
            <a
              href={`/user/${props.username}/library/songs`}
              class="cursor-pointer hover:opacity-80"
            >
              <p>See more</p>
            </a>
          </div>
        </div>
        Comments
        <br />
        {loggedUser && (
          <div class="pb-4 mt-4 mb-4">
            <form onsubmit={handleSendComment} class="flex">
              <input
                type="text"
                class="border border-[#3f4147] w-[100%] bg-[#3f4147] "
                value={comment()}
                onInput={(e) => setComment(e.target.value)}
              />
              <button class="border border-[#3f4147] ml-4 p-4 hover:border-slate-500 transition-all duration-200">
                Send
              </button>
            </form>
          </div>
        )}
        <div class="flex flex-col space-y-2">
          {comments().map((comment) => (
            <Comment
              avatar={
                comment.sender.profilePicture
                  ? comment.sender.profilePicture
                  : comment.sender.avatar
              }
              username={comment.sender.userName}
              comment={comment.comment}
              commentId={comment.id}
              date={new Date(comment.creation_Date).toLocaleDateString()}
              loggedUser={loggedUser}
              recipientId={comment.id_Recipient}
              onDelete={handleDeleteComment}
              subject="profile"
              isAdmin={admin() ? true : false}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
export default MainPage;
