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
    // load the first image faster by attaching onload to all images
    // the way this currently works means that there is a chance if
    // slide duration was too fast that the slideshow might try to
    // show an image before it is loaded.
    this.state.images.forEach((image, index) => {
      image.onload = () => {
        this.finishLoading(index);
      };
    });
  }

  finishLoading(index) {
    if (this.state.loading) {
      this.setState({ index, loading: false });
      this.delayFadeout();

      setInterval(() => {
        this.loadNextFrame();
      }, this.props.slideDuration);
    }
  }

  nextSlide(slide) {
    const index =
      this.state.index === this.state.images.length - 1
        ? 0
        : this.state.index + 1;
    this.setState({ index });
    this.imageRef.current.className = "";
  }

  delayFadeout() {
    setTimeout(() => {
      if (this.imageRef && this.imageRef.current) {
        this.imageRef.current.className = "fade";
      }
    }, this.props.slideDuration - 1000);
  }

  // Note that there is still an issue where the first image displays multiple times. Not sure why
  loadNextFrame() {
    this.delayFadeout();
    this.nextSlide();
  }

  render() {
    const { index, loading, images } = this.state;
    const { src, height, width } = images[index];
    const { offsetHeight, offsetWidth } = document.body;
    const constrainDimension =
      width / height > 2.5
        ? { width: offsetWidth - 100 }
        : { height: offsetHeight - 100 };

    if (loading) {
      return <p>Loading</p>;
    } else {
      return (
        <div style={{ height: "100%", width: "100%", backgroundColor: "#000" }}>
          <div
            style={{
              padding: 30,
              objectFit: "contain",
              width: offsetWidth - 100,
              height: offsetHeight - 60,
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
        </div>
      );
    }
  }
}
