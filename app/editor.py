from flask import (
    Blueprint, flash, g, redirect, render_template, request, url_for
)
from werkzeug.exceptions import abort

from app.auth import login_required
from app.db import get_db


bp = Blueprint('editor', __name__, url_prefix="/editor")


@bp.route('/')
@login_required
def index():
    db = get_db()
    posts = db.execute(
        'SELECT p.id, title, body, created, author_id, username'
        ' FROM post p JOIN user u ON p.author_id = u.id'
        ' WHERE p.author_id = ?'
        ' ORDER BY created DESC',
        str(g.user['id'])
    ).fetchall()
    return render_template('editor/index.html', posts=posts)


@bp.route('/create')
@login_required
def create():
    body = '<div id="title" onkeyup="bindTitle(event)" data-bind="title" class="title" contenteditable="true" placeholder="A story begins with a title."></div>'

    db = get_db()
    db.execute(
        'INSERT INTO post (author_id)'
        ' VALUES (?)',
        (g.user['id'],)
    )
    db.commit()

    id = db.execute(
        'SELECT MAX(id) FROM post WHERE author_id = ?',
        str(g.user['id'])
    ).fetchone()[0]

    return redirect(url_for('editor.open', id=id))


def get_post(id, check_author=True):
    post = get_db().execute(
        'SELECT p.id, title, body, created, author_id, username'
        ' FROM post p JOIN user u ON p.author_id = u.id'
        ' WHERE p.id = ?',
        (id,)
    ).fetchone()

    if post is None:
        abort(404, "Post id {0} doesn't exist.".format(id))

    if check_author and post['author_id'] != g.user['id']:
        abort(403)

    return post


@ bp.route('/<int:id>')
@ login_required
def open(id):
    db = get_db()
    posts = db.execute(
        'SELECT p.id, title, body, created, author_id, username'
        ' FROM post p JOIN user u ON p.author_id = u.id'
        ' WHERE p.author_id = ?'
        ' ORDER BY created DESC',
        (g.user['id'],)
    ).fetchall()
    post = get_post(id)

    return render_template('editor/editor.html', post=post, posts=posts)


@ bp.route('/<int:id>/update', methods=('POST',))
@ login_required
def update(id):
    post = get_post(id)

    title = request.form['title']
    body = request.form['body']

    db = get_db()
    db.execute(
        'UPDATE post SET title = ?, body = ?'
        ' WHERE id = ?',
        (title, body, id)
    )
    db.commit()

    return redirect(url_for('editor.open', id=id))


@bp.route('/<int:id>/delete')
@login_required
def delete(id):
    get_post(id)
    db = get_db()
    db.execute('DELETE FROM post WHERE id = ?', (id,))
    db.commit()

    id_redirect = db.execute(
        'SELECT MAX(id) FROM post WHERE author_id = ?',
        (g.user['id'],)
    ).fetchone()[0]

    if id_redirect:
        return redirect(url_for('editor.open', id=id_redirect))

    return redirect(url_for('editor.index'))
