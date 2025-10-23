 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/app.js b/app.js
new file mode 100644
index 0000000000000000000000000000000000000000..f9f5940d586eee03e15df35c4d468c479a11c4d1
--- /dev/null
+++ b/app.js
@@ -0,0 +1,86 @@
+// يجعل موضع/مقياس المجسم مرتبطين بتغيّر حجم الماركر في المشهد
+AFRAME.registerComponent('relative-to-marker', {
+  schema: {
+    marker: { type: 'selector' },
+    offset: { type: 'vec3', default: { x: 0.65, y: 0, z: 0 } },
+    'scale-multiplier': { type: 'number', default: 1.25 }
+  },
+  tick: function () {
+    if (!this.data.marker) return;
+    const markerObj = this.data.marker.object3D;
+    const markerScale = markerObj.scale;
+    const offset = this.data.offset;
+    const scaleMultiplier = this.data['scale-multiplier'];
+    this.el.object3D.scale.set(
+      markerScale.x * scaleMultiplier,
+      markerScale.y * scaleMultiplier,
+      markerScale.z * scaleMultiplier
+    );
+    this.el.object3D.position.set(
+      offset.x * markerScale.x,
+      offset.y * markerScale.y,
+      offset.z * markerScale.z
+    );
+  }
+});
+
+const toast = document.getElementById('cameraToast');
+const toastText = document.getElementById('cameraToastText');
+const requestBtn = document.getElementById('cameraRequest');
+const dismissBtn = document.getElementById('cameraDismiss');
+
+const closeToast = () => {
+  if (!toast) return;
+  toast.style.opacity = '0';
+  toast.style.pointerEvents = 'none';
+  setTimeout(() => toast.remove(), 400);
+};
+
+dismissBtn?.addEventListener('click', closeToast);
+
+async function requestCameraAccess(triggeredByUser = false) {
+  if (!navigator.mediaDevices?.getUserMedia) {
+    toastText?.textContent = '⚠️ المتصفح لا يدعم الوصول للكاميرا تلقائياً. استخدم متصفحاً محدثاً أو اضغط على زر السماح.';
+    return;
+  }
+
+  try {
+    const stream = await navigator.mediaDevices.getUserMedia({
+      video: {
+        facingMode: { ideal: 'environment' },
+        width: { ideal: 1280 },
+        height: { ideal: 720 }
+      }
+    });
+
+    stream.getTracks().forEach((track) => track.stop());
+    if (toast) {
+      toast.dataset.status = 'granted';
+    }
+    toastText?.textContent = '✅ تم منح صلاحية الكاميرا، سيتم تشغيل المشهد فور التوجيه نحو رمز الـ QR.';
+    if (triggeredByUser) {
+      setTimeout(closeToast, 1800);
+    }
+  } catch (error) {
+    console.warn('تعذّر طلب صلاحية الكاميرا مسبقاً:', error);
+    if (!triggeredByUser) {
+      toastText?.textContent = 'اضغط على "السماح الآن" لتسريع فتح الكاميرا، أو تأكد من منح الإذن من إعدادات المتصفح.';
+    }
+  }
+}
+
+requestBtn?.addEventListener('click', () => requestCameraAccess(true));
+
+window.addEventListener('camera-error', (event) => {
+  alert('⚠️ تعذّر الوصول للكاميرا.\nتأكد من إعطاء الإذن واستخدام HTTPS (مثلاً GitHub Pages).');
+  console.error(event);
+});
+
+// محاولة طلب الإذن فور تحميل الصفحة لتسريع استجابة العميل
+const prewarmCamera = () => requestAnimationFrame(() => requestCameraAccess(false));
+
+if (document.readyState === 'complete' || document.readyState === 'interactive') {
+  prewarmCamera();
+} else {
+  window.addEventListener('DOMContentLoaded', prewarmCamera, { once: true });
+}
 
EOF
)
