from flask import Flask, send_from_directory

app = Flask(__name__)


@app.route("/")
def index():
    """Serve the main dashboard page."""
    return send_from_directory(".", "index.html")


@app.route("/<path:path>")
def static_files(path):
    """Serve static assets and any other files needed by the site."""
    return send_from_directory(".", path)


if __name__ == "__main__":
    app.run(debug=True)
