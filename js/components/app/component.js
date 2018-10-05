import axios from "axios";
import React, { Component } from "react";
import Slideshow from "../slideshow";
import config from "../../config/config";
import isEqual from "lodash.isequal";

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

        if (user && user.hasGrantedScopes(scope)) {
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

  async getMediaItems(albumId, pageToken) {
    const authToken = gapi.client.getToken().access_token;

    const defaultConfig = {
      albumId,
      pageSize: 100,
      headers: { Authorization: `Bearer ${authToken}` }
    };

    const config = pageToken
      ? Object.assign({}, defaultConfig, { pageToken })
      : defaultConfig;

    const { data } = await axios.post(
      "https://photoslibrary.googleapis.com/v1/mediaItems:search",
      { albumId, pageToken, pageSize: 100 },
      config
    );

    const media = data.mediaItems.map(item => {
      return `${item.baseUrl}=w${item.mediaMetadata.width}-h${
        item.mediaMetadata.height
      }`;
    });

    return {
      nextPageToken: data.nextPageToken,
      media
    };
  }

  async chooseAlbum(albumId) {
    await this.fetchAlbumContents(albumId);

    // poll every 10 minutes for new photos in album
    setInterval(async () => {
      await this.fetchAlbumContents(albumId);
    }, 600000);
  }

  async fetchAlbumContents(albumId) {
    const pages = [];
    pages.push(await this.getMediaItems(albumId));

    let nextPage = true;
    let i = 0;
    while (nextPage) {
      if (pages[i].nextPageToken) {
        pages.push(await this.getMediaItems(albumId, pages[i].nextPageToken));
        i++;
      } else {
        nextPage = false;
      }
    }

    const media = pages.reduce((acc, mediaPage) => {
      return acc.concat(mediaPage.media);
    }, []);

    if (!isEqual(this.state.media, media)) {
      console.log(`updated media items at ${new Date()}`);
      this.setState({
        media
      });
    }
  }

  render() {
    if (this.state.media.length) {
      return <Slideshow imageUrls={this.state.media} slideDuration={10000} />;
    }

    return (
      <div>
        <h3>Choose an Album</h3>
        <ul>
          {this.state.albums.map((album, i) => (
            <li key={i}>
              <a
                onClick={async () => {
                  await this.chooseAlbum(album.id);
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
