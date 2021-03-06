var express = require('express');
var bcrypt = require('bcrypt');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();
var Usuario = require('../models/usuario');

// ==================================================
// Obtener todos los usuarios
// ==================================================
app.get('/', (req, res, next) => {
  const desde = Number(req.query.desde || 0);
  Usuario.find({}, 'nombre email img role')
    .skip(desde)
    .limit(5)
    .exec((err, usuarios) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error cargando usuario',
          errors: err,
        });
      }

      Usuario.count({}, (err, total) => {
        res.status(200).json({
          ok: true,
          usuarios,
          total,
        });
      });
    });
});

// ==================================================
// Actualizar usuario
// ==================================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
  let id = req.params.id;
  let body = req.body;

  Usuario.findById(id, (err, usuario) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error al buscar usuario',
        errors: err,
      });
    }

    if (!usuario) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El usuario con el id: ' + id + 'no existe',
        errors: { message: 'No existe un usuario con ese ID' },
      });
    }

    usuario.nombre = body.nombre;
    usuario.email = body.email;
    usuario.role = body.role;

    usuario.save((err, usuarioGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar usuario',
          errors: err,
        });
      }

      usuarioGuardado.password = ':)';

      res.json({
        ok: true,
        usuario: usuarioGuardado,
      });
    });
  });
});

// ==================================================
// Crear un nuevo usuario
// ==================================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {
  var body = req.body;

  let usuario = new Usuario({
    nombre: body.nombre,
    email: body.email,
    password: bcrypt.hashSync(body.password, 10),
    img: body.img,
    role: body.role,
  });

  usuario.save((err, usuarioGuardado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error al crear usuario',
        errors: err,
      });
    }
    res.status(201).json({
      ok: true,
      usuario: usuarioGuardado,
    });
  });
});

// ==================================================
// Borrar un usuario por id
// ==================================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
  let id = req.params.id;

  Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al borrar usuario',
        errors: err,
      });
    }
    if (!usuarioBorrado) {
      return res.status(400).json({
        ok: false,
        mensaje: 'No existe un usuario con ese id',
        errors: { message: 'No existe un usuario con ese id' },
      });
    }
    res.status(200).json({
      ok: true,
      usuario: usuarioBorrado,
    });
  });
});

module.exports = app;
