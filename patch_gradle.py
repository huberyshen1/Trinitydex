import os

gradle_path = os.path.join("android", "build.gradle")
if not os.path.exists(gradle_path):
    print(f"Error: {gradle_path} not found!")
    exit(1)

with open(gradle_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Inject into the main buildscript block
# Find 'buildscript {' and insert configurations block right after it
buildscript_marker = "buildscript {"
idx = content.find(buildscript_marker)
if idx == -1:
    print("Error: Could not find buildscript block in root build.gradle!")
    exit(1)

insert_idx = idx + len(buildscript_marker)
injection = """
    configurations.all {
        resolutionStrategy {
            force 'org.bouncycastle:bcprov-jdk18on:1.78'
        }
    }
"""

patched_content = content[:insert_idx] + injection + content[insert_idx:]

# 2. Append subprojects block to the bottom of the file
subprojects_append = """

subprojects {
    buildscript {
        configurations.all {
            resolutionStrategy {
                force 'org.bouncycastle:bcprov-jdk18on:1.78'
            }
        }
    }
    configurations.all {
        resolutionStrategy {
            force 'org.bouncycastle:bcprov-jdk18on:1.78'
        }
    }
}
"""

patched_content += subprojects_append

with open(gradle_path, "w", encoding="utf-8") as f:
    f.write(patched_content)

print("Successfully patched android/build.gradle with BouncyCastle 1.78 force-resolution strategy!")
