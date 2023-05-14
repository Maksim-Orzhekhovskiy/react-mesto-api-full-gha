const bcrypt = require('bcrypt');
const { ValidationError, DocumentNotFoundError, CastError } = require('mongoose').Error;
const jwt = require('jsonwebtoken');
const User = require('../model/users');
const NotFoundError = require('../errors/notFoundError');
const IncorrectDataError = require('../errors/incorrectDataError');
const ConflictError = require('../errors/conflictError');

const { NODE_ENV, JWT_SECRET } = process.env;

const getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.send(users))
    .catch(next);
};

const getUserById = (req, res, userData, next) => {
  User.findById(userData)
    .orFail(() => new NotFoundError('Пользователь с указанным id не существует'))
    .then((user) => res.send(user))
    .catch(next);
};

const getUser = (req, res, next) => {
  const requiredData = req.params.userId;
  getUserById(req, res, requiredData, next);
};

const createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  bcrypt
    .hash(password, 10)
    .then((hash) => User.create({
      name,
      about,
      avatar,
      email,
      password: hash,
    }))
    .then((user) => {
      const data = user.toObject();
      delete data.password;
      res.status(201).send(data);
    })
    .catch((err) => {
      if (err instanceof ValidationError) {
        next(new IncorrectDataError('Переданы некорректные данные для создания пользователя.'));
      } else if (err.code === 11000) {
        next(new ConflictError('Указанный email уже зарегистрирован. Пожалуйста используйте другой email'));
      } else {
        next(err);
      }
    });
};

const userUpdate = (req, res, updateUser, next) => {
  const userId = req.user._id;
  User.findByIdAndUpdate(userId, updateUser, { new: true, runValidators: true })
    .orFail(() => new NotFoundError('Пользователь с указанным id не существует'))
    .then((user) => res.send(user))
    .catch((err) => {
      if (err instanceof DocumentNotFoundError) {
        next(new NotFoundError(`В базе данных не найден пользователь с ID: ${req.user._id}.`));
      } else if (err instanceof CastError) {
        next(new IncorrectDataError(`Передан некорректный ID пользователя: ${req.user._id}.`));
      } else if (err instanceof ValidationError) {
        next(new IncorrectDataError('Переданы некорректные данные для редактирования профиля.'));
      } else {
        next(err);
      }
    });
};

const getUserInfo = (req, res, next) => {
  const dataUser = req.user._id;
  getUserById(req, res, dataUser, next);
};

const updateUserAvatar = (req, res, next) => {
  const updateUser = req.body;
  userUpdate(req, res, updateUser, next);
};

const updateUserInfo = (req, res, next) => {
  const updateUser = req.body;
  userUpdate(req, res, updateUser, next);
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret-key',
        { expiresIn: '7d' },
      );
      res
        .cookie('jwt', token, {
          maxAge: 3600000 * 24 * 7,
          httpOnly: true,
          sameSite: 'none',
          secure: true,
        })
        .send({ token });
      res.status(200).send({ message: 'Аутентификация прошла успешно' });
    })
    .catch(next);
};

module.exports = {
  getUsers,
  getUser,
  getUserInfo,
  createUser,
  updateUserInfo,
  updateUserAvatar,
  login,
};
