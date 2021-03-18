import os
from flask import Flask, Blueprint


def create_app(test_config=None, debug=True):
    # create and configure the app
    app = Flask(__name__)
    app.config.from_mapping(
        SECRET_KEY='dev', # hide in prod
        DATABASE=os.path.join(app.instance_path, 'app.db')
    )

    from . import auth
    app.register_blueprint(auth.bp)

    from . import editor
    app.register_blueprint(editor.bp)

    from . import db
    db.init_app(app)

    return app
