import React from 'react';
import { Link } from 'react-router-dom';
import TicketList from './ticket_list';
import Modal from 'react-modal';
import TicketModalStyle from '../../util/ticket_modal_style';
import SessionForm from '../session/session_form';
import SessionModalStyle from '../../util/modal_style';



export default class EventDetail extends React.Component {
    constructor(props){
        super(props);
        this.state = { modalOpen: false };
        this.onModalClose = this.onModalClose.bind(this);
        this.onModalOpen = this.onModalOpen.bind(this);
        this.handleModalClick = this.handleModalClick.bind(this);
        this.add = this.add.bind(this);
        this.remove = this.remove.bind(this);
    }

    componentDidMount() {
        this.props.fetchEvent(this.props.eventId);
    }

    add(eventId) {
        return e => this.props.addBookmark({ event_id: eventId, user_id: this.props.currentUser.id })
    }

    remove(eventId) {
        return e => this.props.removeBookmark(eventId);
    }
    
    handleModalClick(event) {
        this.setState({
            modalOpen: true
        });
    }

    onModalClose() {
        const modalStyle = this.props.currentUserId ? TicketModalStyle : SessionModalStyle;
        this.setState({ modalOpen: false });
        modalStyle.content.opacity = 0;
    }

    onModalOpen() {
        const modalStyle = this.props.currentUserId ? TicketModalStyle : SessionModalStyle;
        modalStyle.content.opacity = 100;
    }
    
    render(){
        const { event, currentUserId, currentUser, login, signup, errors } = this.props;
        const modalStyle = currentUserId ? TicketModalStyle : SessionModalStyle;
        const dateOptions1 = { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' };
        const dateOptions2 = { weekday: 'short', month: 'short', day: 'numeric', year: '2-digit' };
        const timeOptions1 = { hour: 'numeric', minute: 'numeric' }
        const timeOptions2 = { hour: 'numeric', minute: 'numeric', timeZoneName: 'short' }
        let date;
        if (event) {
            const tickets = event.tickets ? Object.values(event.tickets) : [];
            if (event.start_date === event.end_date) {
                date = new Date(event.start_date).toLocaleString('en-US', dateOptions1)
            }else{
                date = `${new Date(event.start_date).toLocaleString('en-US', dateOptions2)} - ${new Date(event.end_date).toLocaleString('en-US', dateOptions2)}`
            }
            const time = `${new Date(event.start_time).toLocaleString('en-US', timeOptions1)} - ${new Date(event.end_time).toLocaleString('en-US', timeOptions2)}`
            return(
                <div>
                    <div
                        className="event-detail-blur-bg"
                        style={{ backgroundImage: `url(${event.image_url.replace('http', 'https')})` }}>
                    </div>
                    <div className="event-detail-main-container">
                        <div className="event-detail-header">
                            <div className="event-detail-header-bg"
                                style={{ backgroundImage: `url(${event.image_url.replace('http', 'https')})` }}>
                            </div>
                            <div className="event-detail-header-info">
                                <div className="event-detail-header-month">
                                    {new Date(event.start_date).toLocaleString('en-US', { month: 'short'} )}
                                </div>
                                <div className="event-detail-header-date">
                                    {new Date(event.start_date).toLocaleString('en-US', { day: 'numeric'} )}
                                </div>
                                <div className="event-detail-header-title">
                                    {event.title}
                                </div>
                                <div className="event-detail-header-organizer">
                                    Hosted by <strong>{event.organizer}</strong>
                                </div>
                            </div>
                        </div>
                        <div className="event-detail-register-bar">
                        <div>
                            {!currentUser || currentUser.bookmarked_event_ids.indexOf(event.id) < 0 ?
                                <i className="fa fa-bookmark-o" onClick={this.add(event.id)} aria-hidden="true"></i> :
                                <i className="fa fa-bookmark" onClick={this.remove(event.id)} aria-hidden="true"></i>
                            }
                            
                                {event.category_names.filter(el => el.length > 0).map((name, idx) =>
                                    <Link key={idx} to={`/category/${name}`}>{name.replace("_", "&")}</Link>
                                )}
                            
                        </div>
                            <button onClick={this.handleModalClick}>Register</button>
                        </div>
                        <div className="event-detail-content">
                            <div className="event-detail-content-main">
                                <div><b>DESCRIPTION</b></div>
                                <div className="event-detail-description">
                                    <div dangerouslySetInnerHTML={{ __html: event.description }}></div>
                                </div>
                            </div>
                            <div className="event-detail-content-sidebar">
                                <div><b>DATE AND TIME</b></div>
                                <div className="event-detail-datetime">
                                    <div>
                                        {date}
                                        <div className="event-detail-time">{time}</div>
                                    </div>
                                </div>
                                <div><b>LOCATION</b></div>
                                <div className="event-detail-location">
                                    {event.is_online_event ? "This event is online." :
                                    <ul>
                                        {event.address.map((el, idx) => <li key={idx}>{el}</li>)}
                                    </ul>
                                    }
                                </div>
                            </div>
                        </div>
                        <div className="event-detail-organizer-detail">
                            <center>
                                <div><b>ORANGIZER OF THIS EVENT</b></div>
                                <img src="https://s3-us-west-1.amazonaws.com/eventise-dev/149071.svg" />
                                <div className="organizer">{event.organizer}</div>    
                            </center>
                        </div>
                        { currentUserId === event.organizer_id ?
                        <div className="event-detail-edit-bar">
                            <Link to={`/events/${event.id}/edit`}><button>Edit this event</button></Link>
                        </div>
                        : ""}
                    </div>
                    <Modal
                        isOpen={this.state.modalOpen}
                        onRequestClose={this.onModalClose}
                        style={modalStyle}
                        onAfterOpen={this.onModalOpen}>
                    { currentUserId ?
                    <TicketList
                        tickets={tickets}
                        event={event}
                        fetchEvent={this.props.fetchEvent}
                        currentUserId={currentUserId}
                        createOrder={this.props.createOrder}
                        onModalClose={this.onModalClose}/>
                    :
                    <SessionForm
                        login={login}
                        signup={signup}
                        errors={errors}
                        onModalClose={this.onModalClose} />
                    }
                    </Modal>
                </div>
            )
        }else{
            return(<div>Loading...</div>)
        }
    }
}