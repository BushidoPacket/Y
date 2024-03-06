import classes from "./Feed.module.css";

function Feed() {
  return (
    <>
      <h1>Feed</h1>
      <div className={classes.container}>
        <div className={classes.post}>
          <img />
          <h3>Author</h3>
          <p>Post Content</p>
          <div className={classes.footPostContainer}>
            <div className={classes.timestamp}>06.03.2024</div>
            <div className={classes.buttonContainer}>
              <button>
                <img src="../icons/edit.png" title="edit" />
              </button>
              <button>
                <img src="../icons/bin.png" title="delete" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Feed;
