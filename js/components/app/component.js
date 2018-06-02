import React, { Component } from "react";

import Slideshow from "../slideshow";

class App extends Component {
  render() {
    return (
      <Slideshow
        imageUrls={[
          "https://picsum.photos/300/400",
          "https://picsum.photos/500/400",
          "https://picsum.photos/500/200"
        ]}
      />
    );
  }
}

export default App;
