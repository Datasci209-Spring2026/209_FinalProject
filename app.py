from flask import Flask, send_from_directory
import os

app = Flask(__name__)

# ------------------------------------------------------------
# OLD ROUTE (DISABLED)
# ------------------------------------------------------------
# This was forcing Vercel to always load w209.html
#
# @app.route("/")
# def index():
#     return render_template('w209.html', file=file)
#
# ------------------------------------------------------------


# ------------------------------------------------------------
# NEW ROOT ROUTE
# ------------------------------------------------------------
# This will serve your new HTML file if Flask is used
# (Vercel should ideally bypass Flask entirely for this)
# ------------------------------------------------------------
@app.route("/")
def index():
    return send_from_directory(".", "williamprojecteda.html")


# ------------------------------------------------------------
# OPTIONAL: serve static assets (useful for local Flask testing)
# ------------------------------------------------------------
@app.route("/<path:path>")
def static_files(path):
    return send_from_directory(".", path)


# ------------------------------------------------------------
# LOCAL DEV ONLY
# ------------------------------------------------------------
if __name__ == "__main__":
    app.run(debug=True)
