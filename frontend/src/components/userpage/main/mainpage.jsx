import ScrobbleRow from "./scrobbleRow";
import Card from "./card";
import Comment from "./comment";
import { createEffect, createSignal } from "solid-js";
import { postData } from "../../../getUserData";
import ArrowUp from "../../../assets/icons/arrow-up.svg";
import Belmondo from "../../../assets/icons/belmondoblur.png";

function MainPage(props) {
  const { loggedUser } = props;
  const [comments, setComments] = createSignal(props.comments);
  const [comment, setComment] = createSignal("");

  createEffect(() => {
    setComments(props.comments);
  }, [props.comments]);

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
      rating: "5/5",
      secText: "will appear here",
      heart: "heart",
    }
  ];


  return (
    <div class="flex flex-col xl:flex-row-reverse overflow-y-auto 2xl:h-[80%] text-[#f2f3ea] w-full">
      <div class="xl:border-l-2 border-[#3f4147] w-full xl:w-[40%] p-6 xl:overflow-y-auto">
        Scrobbles
        <div class="flex flex-col space-y-2 mt-2">
          {props.scrobbles.slice(0,10).map((scrobble) => (
            <ScrobbleRow
              albumCover={scrobble.song.album.cover}
              heart="heart"
              title={scrobble.song.title}
              artist={scrobble.song.album.artist.name}
              album={scrobble.song.album.name}
              rating="5/5"
              date={scrobble.scrobble_Date}
            />
          ))}
        </div>
      </div>
      <div id="page" class="xl:w-[60%] p-6 xl:overflow-y-auto">
        Artist
        <br />
        <div class="grid grid-cols-2 lg:grid-cols-5 w-[100%] gap-4 mt-4 mb-4">
          {props.topArtists.length !== 0 ?
          props.topArtists.slice(0,5).map((topArtist) => (
            <Card
              cover={`data:image/png;base64,${topArtist.artist.photo}`}
              mainText={topArtist.artist.name}
              rating={topArtist.rating}
              heart="heart"
              subject="artist"
            />
          )) :
          mockCard.slice(0,5).map((topArtist) => (
            <Card
              cover={topArtist.cover}
              mainText={topArtist.mainText}
              secText={topArtist.secText}
              rating={topArtist.rating}
              heart={topArtist.heart}
              subject="artist"
            />
          ))
        }
          <div class="flex flex-col justify-center items-center lg:hidden">
            <img class="w-8 h-8 rotate-90" src={ArrowUp} />
            <p class=" text-black">See more</p>
          </div>
        </div>
        Album
        <br />
        <div class="grid grid-cols-2 lg:grid-cols-5 w-[100%] gap-4 mt-4 mb-4">
          {props.topAlbums.length !== 0 ?
          props.topAlbums.slice(0,5).map((topAlbum) => (
            <Card
              cover={`data:image/png;base64,${topAlbum.album.cover}`}
              mainText={topAlbum.album.name}
              secText={topAlbum.album.artist.name}
              rating={topAlbum.rating}
              heart="heart"
              subject="album"
            />
          )) :
          mockCard.slice(0,5).map((topAlbum) => (
            <Card
              cover={topAlbum.cover}
              mainText={topAlbum.mainText}
              secText={topAlbum.secText}
              rating={topAlbum.rating}
              heart={topAlbum.heart}
              subject="album"
            />
          ))
          }
          <div class="flex flex-col justify-center items-center lg:hidden">
            <img class="w-8 h-8 rotate-90" src={ArrowUp} />
            <p class=" text-black">See more</p>
          </div>
        </div>
        Song
        <br />
        <div class="grid grid-cols-2 lg:grid-cols-5 w-[100%] gap-4 mt-4 mb-4">
          {props.topSongs.length !== 0 ?
          props.topSongs.slice(0,5).map((topSong) => (
            <Card
              cover={`data:image/png;base64,${topSong.song.album.cover}`}
              mainText={topSong.song.title}
              secText={topSong.song.album.artist.name}
              rating={topSong.rating}
              heart="heart"
              subject="song"
            />
          )) :
          mockCard.slice(0,5).map((topSong) => (
            <Card
              cover={topSong.cover}
              mainText={topSong.mainText}
              secText={topSong.secText}
              rating={topSong.rating}
              heart={topSong.heart}
              subject="song"
            />
          ))
        }
          <div class="flex flex-col justify-center items-center lg:hidden">
            <img class="w-8 h-8 rotate-90" src={ArrowUp} />
            <p class=" text-black">See more</p>
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
              <button class="border border-[#3f4147] ml-4 p-4 hover:border-slate-500 transition-all duration-200">Send</button>
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
          />
        ))}
        </div>
      </div>
      
    </div>
  );
}
export default MainPage;
