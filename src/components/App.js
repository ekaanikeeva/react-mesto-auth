import React from "react";
import "../index.js";
import Header from "./Header";
import Main from "./Main";
import Footer from "./Footer";
import PopupWithForm from "./PopupWithForm";
import ImagePopup from "./ImagePopup";
import { api } from "../utils/Api";
import { CurrentUserContext } from "../context/CurrentUserContext.js";
import { CardsContext } from "../context/CardsContext.js";
import EditProfilePopup from "./EditProfilePopup";
import EditAvatarPopup from "./EditAvatarPopup.js";
import AddPlacePopup from "./AddPlacePopup.js";

function App() {
  const [isAvatarPopupOpen, setIsAvatarPopupOpen] = React.useState(false);
  const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] =
    React.useState(false);
  const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = React.useState(false);
  const [selectedCard, setSelectedCard] = React.useState(null);
  const [currentUser, setCurrentUser] = React.useState("");
  const [cards, setCards] = React.useState([]);

  React.useEffect(() => {
    api
      .getUserInfo()
      .then((res) => setCurrentUser(res))
      .catch((err) => {
        console.log(`Не удалось загрузить данные пользователя ${err}`);
      });

    api
      .getInitialCards()
      .then((res) => {
        setCards(res);
      })
      .catch((err) => {
        console.log(`Не удалось загрузить карточки на страницу ${err}`);
      });
  }, []);
  function handleEditAvatarClick() {
    setIsAvatarPopupOpen(true);
  }
  function handleEditProfileClick() {
    setIsEditProfilePopupOpen(true);
  }
  function handleAddPlaceClick() {
    setIsAddPlacePopupOpen(true);
  }

  function handleCardClick(card) {
    setSelectedCard(card);
  }
  function closeAllPopups() {
    setIsAddPlacePopupOpen(false);
    setIsAvatarPopupOpen(false);
    setIsEditProfilePopupOpen(false);
    setSelectedCard(null);
  }

  function handleCardLike(card) {
    const isLiked = card.likes.some(
      (someLike) => someLike._id === currentUser._id
    );
    {
      !isLiked
        ? api
            .postLike(card._id)
            .then((newCard) =>
              setCards((state) =>
                state.map((cardLikes) =>
                  cardLikes._id === card._id ? newCard : cardLikes
                )
              )
            )
            .catch((err) => {
              console.log(
                `Не удалось постаить лайк картинке. Попробуйте позже ${err}`
              );
            })
        : api
            .deleteLike(card._id)
            .then((newCard) =>
              setCards((cardsArray) =>
                cardsArray.map((cardLikes) =>
                  cardLikes._id === card._id ? newCard : cardLikes
                )
              )
            )
            .catch((err) => {
              console.log(`Лайк остался, не удалось убрать лайк ${err}`);
            });
    }
  }

  function handleCardDelete(card) {
    api
      .deleteCard(card._id)
      .then(() =>
        setCards((cardsArray) =>
          cardsArray.filter((element) =>
            element._id === card._id ? card.remove : element
          )
        )
      )
      .catch((err) => {
        console.log(`Не удалось удалить картинку ${err}`);
      });
  }

  function handleUpdateUser({ name, about }) {
    api
      .setUserInform({ name, about })
      .then((res) => {
        setCurrentUser(res);
        closeAllPopups();
      })
      .catch((err) => {
        console.log(`Не удалось редактировать данные пользователя ${err}`);
      });
  }

  function handleUpdateAvatar(avatar) {
    api
      .changeAvatar(avatar)
      .then((res) => {
        setCurrentUser(res);
        closeAllPopups();
      })
      .catch((err) => {
        console.log(`Не удалось редактировать аватар пользователя ${err}`);
      });
  }

  function handleAddPlaceSubmit({ title, link }) {
    api
      .addCard({ title, link })
      .then((res) => {
        setCards([res, ...cards]);
        closeAllPopups();
      })
      .catch((err) => {
        console.log(`Не удалось добавить новое место ${err}`);
      });
  }

  return (
    <div className="root">
      <CurrentUserContext.Provider value={currentUser}>
        <EditProfilePopup
          isOpen={isEditProfilePopupOpen}
          onClose={closeAllPopups}
          onUpdateUser={handleUpdateUser}
        />

        <EditAvatarPopup
          isOpen={isAvatarPopupOpen}
          onClose={closeAllPopups}
          onUpdateAvatar={handleUpdateAvatar}
        />

        <AddPlacePopup
          isOpen={isAddPlacePopupOpen}
          onClose={closeAllPopups}
          onAddCard={handleAddPlaceSubmit}
        />

        <PopupWithForm
          name="delete-card"
          title="Вы уверены?"
          nameSubmitBtn="Да"
        ></PopupWithForm>

        <Header />
        <CardsContext.Provider value={cards}>
          <Main
            onEditProfile={handleEditProfileClick}
            onAddPlace={handleAddPlaceClick}
            onEditAvatar={handleEditAvatarClick}
            onCardClick={handleCardClick}
            handleCardLike={handleCardLike}
            handleCardDelete={handleCardDelete}
          />
        </CardsContext.Provider>
        <Footer />
        {selectedCard && (
          <ImagePopup
            isOpen={selectedCard}
            onClose={closeAllPopups}
            link={selectedCard.link}
            name={selectedCard.name}
          ></ImagePopup>
        )}
      </CurrentUserContext.Provider>
    </div>
  );
}

export default App;
