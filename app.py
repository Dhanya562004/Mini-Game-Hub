import os
import streamlit as st
import streamlit.components.v1 as components

# --------------------------------------------------
# STREAMLIT PAGE CONFIGURATION
# --------------------------------------------------
st.set_page_config(
    page_title="Mini Game Hub 🎮",
    page_icon="🎮",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Hide Streamlit header, footer, and default margins for full-screen immersive UI
hide_st_style = """
    <style>
        #MainMenu {visibility: hidden;}
        footer {visibility: hidden;}
        header {visibility: hidden;}
        .block-container {
            padding-top: 0rem !important;
            padding-bottom: 0rem !important;
            padding-left: 0rem !important;
            padding-right: 0rem !important;
            max-width: 100% !important;
        }
        iframe {
            border: none;
            width: 100%;
        }
    </style>
"""
st.markdown(hide_st_style, unsafe_allow_html=True)


def load_frontend_app():
    """Reads index.html, style.css, and script.js and embeds them into a single standalone HTML package."""
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    html_path = os.path.join(base_dir, "index.html")
    css_path = os.path.join(base_dir, "style.css")
    js_path = os.path.join(base_dir, "script.js")
    
    with open(html_path, "r", encoding="utf-8") as f:
        html_content = f.read()
        
    with open(css_path, "r", encoding="utf-8") as f:
        css_content = f.read()
        
    with open(js_path, "r", encoding="utf-8") as f:
        js_content = f.read()
        
    # Replace external css/js links with inline tags for Streamlit component embedding
    inline_css = f"<style>\n{css_content}\n</style>"
    inline_js = f"<script>\n{js_content}\n</script>"
    
    html_content = html_content.replace('<link rel="stylesheet" href="style.css">', inline_css)
    html_content = html_content.replace('<script src="script.js"></script>', inline_js)
    
    return html_content


def main():
    html_code = load_frontend_app()
    # Render component with full height
    components.html(html_code, height=950, scrolling=True)


if __name__ == "__main__":
    main()
