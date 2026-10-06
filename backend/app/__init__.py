from flask import Flask, jsonify
from app.config import get_config
from app.extensions import db, migrate, jwt, cors, mail



def create_app():
    app = Flask(__name__)

    # Cargar configuración
    app.config.from_object(get_config())

    # Inicializar extensiones
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    mail.init_app(app)

    # CORS: permitir el frontend
    cors.init_app(
        app,
        resources={r"/api/*": {"origins": app.config["FRONTEND_URL"]}},
        supports_credentials=True,
    )

    # Importar modelos para que Alembic los detecte
    from app import models  # noqa: F401

    # Registrar blueprints
    from app.routes.health import health_bp
    from app.routes.auth import auth_bp
    from app.routes.categorias import categorias_bp
    from app.routes.productos import productos_bp
    from app.routes.variantes import variantes_bp

    app.register_blueprint(health_bp, url_prefix="/api")
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(categorias_bp, url_prefix="/api/categorias")
    app.register_blueprint(productos_bp, url_prefix="/api/productos")
    app.register_blueprint(variantes_bp, url_prefix="/api/variantes")

    # Manejador global de errores 404
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"error": "Recurso no encontrado"}), 404

    # Manejador global de errores 500
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({"error": "Error interno del servidor"}), 500

    return app