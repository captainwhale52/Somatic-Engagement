import React from "react";
import ReactDom from "react-dom";
import { connect } from "react-redux";

import serverConfig from "./../../config/server";
import { convertLinksOpenInNewWindow } from "./../../utils/link";
import { postComment } from "./../../actions/postsActions";

import Textarea from 'react-textarea-autosize';

require('./index.scss');


@connect((store) => {
  return {
    localization: store.localization,
    post: store.post,
    window: store.window,
  }
})
export default class Content extends React.Component {
  constructor() {
    super();
    this.state = {
      theaterDriveinSize: 0,
      theaterDriveinBottomOffset: 0,
      theaterDriveinTextSize: 0,
      comment: "",
      author: "",
      email: "",
    };
  }
  componentWillMount() {

  }
  componentDidMount() {

  }
  componentWillReceiveProps(nextProps) {
    setTimeout(function() {
      convertLinksOpenInNewWindow(ReactDom.findDOMNode(this.refs['content']));

      const iframes = document.querySelectorAll('iframe');
      iframes.forEach((element) => {
        element.height = element.clientWidth * 9 / 16;
      });
    }.bind(this), 100);

    const { window } = nextProps;
    let scale = Math.min(window.size[0] / window.minSize[0], 1);
    this.setState({
      theaterDriveinSize: 320 * scale,
      theaterDriveinBottomOffset: 32 * scale,
      theaterDriveinTextSize: 320 * scale * 0.06,
    });

    if (nextProps.post.commentUpdated) {
      this.setState({
        comment: "",
        author: "",
        email: "",
      });
    }
  }
  handleToggleLibrary(value, event) {
    if (this.props.window.size[0] < 1024) {
      // if (this.props.window.openLibrary == false && value == false) {
      //   this.props.dispatch({type: "SET_OPEN_LIBRARY", payload: true});
      // } else if (this.props.window.openLibrary == true && value == true) {
      //   this.props.dispatch({type: "SET_OPEN_LIBRARY", payload: false});
      // } else {
      //   this.props.dispatch({type: "SET_OPEN_LIBRARY", payload: value});
      // }
      this.props.dispatch({type: "SET_OPEN_LIBRARY", payload: value});
      const page2 = ReactDom.findDOMNode(this.refs['page-2']);
      page2.scrollTop = 0;
    }
  }
  handleOpenLibrary(event) {
    this.props.dispatch({type: "PUSH_ROUTE", payload: "RESEARCH"});
    setTimeout(function() {
      this.props.dispatch({type: "SET_OPEN_LIBRARY", payload: true});
    }.bind(this), 500);
  }
  handleCloseLibrary(event) {
    this.props.dispatch({type: "SET_OPEN_LIBRARY", payload: false});
  }
  handleClickResearchItem(item, event) {
    this.props.dispatch({type: "SET_RESEARCH_ITEM", payload: item});
    const page2 = ReactDom.findDOMNode(this.refs['page-2']);
    page2.scrollTop = 0;
  }
  handleClickProjectItem(item, event) {
    this.props.dispatch({type: "SET_PROJECT_ITEM", payload: item});
    const page3 = ReactDom.findDOMNode(this.refs['page-3']);
    page3.scrollTop = 0;
  }
  handleSubmitComment(event) {
    this.props.dispatch(postComment(this.state.comment, this.state.author, this.state.email));
  }
  render() {
    const { localization } = this.props.localization;
    const { posts, project, comments } = this.props.post;
    const { window } = this.props;

    const about = posts.map((item, index) => {
      if (item.acf.category == "about") {
        return <div className="post" key={"about-" + index} dangerouslySetInnerHTML={{__html: item.content.rendered}} />;
      }
      return null;
    });

    const news = posts.map((item, index) => {
      if (item.acf.category == "news") {
        return <div className="post" key={"news-" + index} dangerouslySetInnerHTML={{__html: item.content.rendered}} />;
      }
      return null;
    });

    let researches = posts.filter((item, index) => {
      if (item.acf.category == "research") {
        return true;
      }
      return false;
    });

    researches = researches.asMutable().sort(function(a, b) {
      if (parseInt(a.acf.importance) > parseInt(b.acf.importance))
        return -1;
      if (parseInt(a.acf.importance) < parseInt(b.acf.importance))
        return 1;
      return 0;
    });

    researches = researches.map((item, index) => {
      return <li className="post" key={"research-" + index}>
        <div dangerouslySetInnerHTML={{__html: item.title.rendered}} onClick={this.handleClickResearchItem.bind(this, item)}/>
      </li>;
    });

    let projectSize = 0;

    let projects = posts.map((item, index) => {
      if (item.acf.category == "project" && projectSize < 3) {
        projectSize++;
        let active = "";
        if (project && item.id == project.id) {
          active = " active"
        }
        return <div className={"item" + active} key={"project-" + index} onClick={this.handleClickProjectItem.bind(this, item)}>
          <div dangerouslySetInnerHTML={{__html: item.title.rendered}} />
        </div>;
      }
      return null;
    });

    let page1Top, page2Right;
    let openLibrary = " hide";
    let openNews = "";
    if (window.openLibrary) {
      openLibrary = "";
      openNews = " hide";
    }
    if (window.researchItem) {
      page1Top = <div className="top research-back" onClick={this.handleClickResearchItem.bind(this, null)}>
        Back to list
      </div>;
      page2Right = <div className={"right" + openLibrary}>
        <div className="top" onClick={this.handleToggleLibrary.bind(this, true)}>
          <div dangerouslySetInnerHTML={{__html: window.researchItem.title.rendered}} />
        </div>
        <div className="middle">
          <div className="container text">
            <div dangerouslySetInnerHTML={{__html: window.researchItem.content.rendered}} />
          </div>
        </div>
        <div className="bottom">
          <div className="button" onClick={this.handleClickResearchItem.bind(this, null)}>
            Back to list
          </div>
        </div>
      </div>;
    } else {
      page1Top = <div className="top" onClick={this.handleToggleLibrary.bind(this, false)}>
        SOMKIDS News
      </div>;
      page2Right = <div className={"right" + openLibrary}>
        <div className="top" onClick={this.handleToggleLibrary.bind(this, true)}>
          SOMKIDS Research
        </div>
        <div className="middle">
          <ul className="container">
            { researches }
          </ul>
        </div>
        <div className="bottom">
          <div className="button" onClick={this.handleCloseLibrary.bind(this)}>
            Leave SOMKIDS library
          </div>
        </div>
      </div>;
    }

    let page3Right;
    if (project) {
      page3Right = <div className="container">
      <div className="title" dangerouslySetInnerHTML={{__html: project.title.rendered}} />
        <div className="text" dangerouslySetInnerHTML={{__html: project.content.rendered}} />
      </div>
    }

    let page4Left = comments.map((item, index) => {
      return <li className="comment" key={"comment-" + index}>
        <div className="text" dangerouslySetInnerHTML={{__html: item.content.rendered}} />
        <div className="author" dangerouslySetInnerHTML={{__html: item.author_name}} />
      </li>;
    });

    let commentTooltip;
    if (this.props.post.commentUpdated) {
      commentTooltip = <div className="tooltip">Your message has been sent successfully.</div>;
    } else {
      commentTooltip = <div className="tooltip">
        Your will be sent to Krystina Madej.
      </div>;
    }


    return(
      <div ref="content" className="content">
        <div className="page page-1">
          <div className="left">
            <div className="title">
              <img className="name" src="./title.png" />
              <img className="logo" src="./kids.png" />
            </div>
            <img className="description" src="./description.png" />
          </div>
          <div ref="post-about" className="right">
            <div className="container">
              { about }
            </div>
          </div>
        </div>
        <div ref="page-2" className="page page-2">
          <div className="button-library" onClick={this.handleOpenLibrary.bind(this)}>
          </div>
          <div className={"left" + openNews}>
            { page1Top }
            <div className="bottom">
              <div className="container">
                { news }
              </div>
            </div>
          </div>
          { page2Right }
        </div>
        <div className="page page-3">
          <div className="right">
            <div style={{
              bottom: this.state.theaterDriveinBottomOffset,
            }} className="wrapper">
              <img className="top" src="./theater-top.png" />
              <div ref="page-3" className="middle">
                { page3Right }
              </div>
              <img className="bottom" src="./theater-bottom.png" />
              <div className="leg">
              </div>
            </div>
          </div>
          <div className="left">
            <div style={{
              width: this.state.theaterDriveinSize,
              height: this.state.theaterDriveinSize,
              bottom: this.state.theaterDriveinBottomOffset * 0.15,
            }} className="wrapper">
              <img className="panel" src="./theater-drivein-panel.png">
              </img>
              <div style={{
                fontSize: this.state.theaterDriveinTextSize,
              }} className="list">
                { projects }
              </div>
              <img className="front" src="./theater-drivein-front.png" />
            </div>

          </div>
        </div>
        <div className="page page-4">
          <div className="right">
            <div className="top">
              Leave a Message
            </div>
            <div className="bottom">
              <label>
                <div className="label">
                  Message
                </div>
                <Textarea
                  value={this.state.comment}
                  onChange={(event) => {
                    this.props.dispatch({type: "RESET_COMMENT_POST_STATUS"});
                    this.setState({comment: event.target.value});
                  }} />
              </label>
              <label>
                <div className="label">
                  Name
                </div>
                <input type="text"
                  value={this.state.author}
                  onChange={(event) => {
                    this.props.dispatch({type: "RESET_COMMENT_POST_STATUS"});
                    this.setState({author: event.target.value});
                  }} />
              </label>
              <label>
                <div className="label">
                  E-mail
                </div>
                <input type="email"
                  value={this.state.email}
                  onChange={(event) => {
                    this.props.dispatch({type: "RESET_COMMENT_POST_STATUS"});
                    this.setState({email: event.target.value});
                  }} />
              </label>
              <label>
                <div className="label button" onClick={this.handleSubmitComment.bind(this)}>
                  Send a Message
                </div>
                { commentTooltip }
              </label>
            </div>
          </div>
          <div className="left">
            <h2 className="top">
              Comments
            </h2>
            <div className="bottom">
              <ul className="container">
                { page4Left }
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

// <div className="content" dangerouslySetInnerHTML={{__html: localization.homepagecontent}} />
