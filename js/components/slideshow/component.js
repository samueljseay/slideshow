import React, { Component } from "react";

export default class Slideshow extends Component {
  constructor(props) {
    super(props);
    const images = props.imageUrls.map(photo => {
      const image = new Image();
      image.src = photo;
      return image;
    });

    this.imageRef = React.createRef();

    this.state = {
      loading: true,
      images,
      index: 0
    };
  }

  componentDidMount() {
    this.state.images[0].onload = this.finishLoading.bind(this);
  }

  finishLoading() {
    this.setState({ loading: false });
    this.loadNextFrame();
  }

  loadNextFrame() {
    setTimeout(() => {
      this.imageRef.current.className += " fade";
    }, 9000);

    setTimeout(() => {
      this.imageRef.current.className = this.imageRef.current.className.replace(
        "fade",
        ""
      );
      const index =
        this.state.index === this.state.images.length - 1
          ? 0
          : this.state.index + 1;
      this.setState({ index });
      this.loadNextFrame();
    }, 10000);
  }

  fadeOutTransition() {}

  photoTooHigh(height) {
    const { offsetHeight } = document.body;
    return height > offsetHeight;
  }

  photoTooWide(width) {
    const { offsetWidth } = document.body;
    return width > offsetWidth;
  }

  render() {
    const { index, loading, images } = this.state;

    const { src, height, width } = images[index];
    const { offsetHeight, offsetWidth } = document.body;

    let constrainDimension = { height: offsetHeight - 100 };

    // if we have a very wide ratio fix to the width constraint
    if (width / 4 > height) {
      const constrainedWidth =
        width > offsetWidth - 100 ? offsetWidth - 100 : width;
      constrainDimension = { width: constrainedWidth, height };
    }

    if (loading) {
      return <p>Loading</p>;
    } else {
      return (
        <div
          style={{
            padding: 50,
            objectFit: "contain",
            width: offsetWidth - 100,
            height: offsetHeight - 100,
            backgroundColor: "#000",
            display: "flex"
          }}
        >
          <img
            src={src}
            ref={this.imageRef}
            style={{
              ...constrainDimension,
              margin: "auto",
              border: "10px solid white",
              opacity: 1,
              transition: "opacity 1s ease-in-out"
            }}
          />
        </div>
      );
    }
  }
}
