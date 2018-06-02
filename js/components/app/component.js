import axios from "axios";
import React, { Component } from "react";
import Slideshow from "../slideshow";
import config from "../config/config";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { albums: [], media: [] };
  }
  componentDidMount() {
    if (window.gapi) {
      gapi.load("client:auth2", this.initializeClient.bind(this));
    }
  }

  initializeClient() {
    const scope = "https://www.googleapis.com/auth/photoslibrary.readonly";
    gapi.client
      .init({
        scope,
        clientId: config.googlePhotosClientID
      })
      .then(() => {
        this.GoogleAuth = gapi.auth2.getAuthInstance();
        const user = this.GoogleAuth.currentUser.get();

        if (user.hasGrantedScopes(scope)) {
          this.fetchAlbums();
        } else {
          this.GoogleAuth.signIn();
        }

        this.GoogleAuth.isSignedIn.listen(() => {
          this.fetchAlbums();
        });
      });
  }

  async fetchAlbums() {
    const scope = "https://www.googleapis.com/auth/photoslibrary.readonly";
    const user = this.GoogleAuth.currentUser.get();

    if (user.hasGrantedScopes(scope)) {
      const authToken = gapi.client.getToken().access_token;

      var config = {
        headers: { Authorization: `Bearer ${authToken}` }
      };

      const { data } = await axios.get(
        "https://photoslibrary.googleapis.com/v1/albums",
        config
      );

      this.setState({ albums: data.albums });
    }
  }

  chooseAlbum(albumId) {
    this.fetchAlbumContents(albumId);
  }

  async fetchAlbumContents(albumId) {
    const authToken = gapi.client.getToken().access_token;

    var config = {
      headers: { Authorization: `Bearer ${authToken}` }
    };

    const { data } = await axios.post(
      "https://photoslibrary.googleapis.com/v1/mediaItems:search",
      { albumId },
      config
    );

    this.setState({ media: data.mediaItems });
  }

  render() {
    const photos = this.state.media;

    if (photos.length) {
      return <Slideshow imageUrls={photos.map(photo => photo.baseUrl)} />;
    }

    return (
      <div>
        <h3>Choose an Album</h3>
        <ul>
          {this.state.albums.map((album, i) => (
            <li key={i}>
              <a
                onClick={() => {
                  this.chooseAlbum(album.id);
                }}
                href="#"
              >
                {album.title}
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

export default App;
